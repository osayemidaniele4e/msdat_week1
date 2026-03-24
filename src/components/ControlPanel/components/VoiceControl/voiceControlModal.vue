<template>
  <BaseModal :showModal="show" @hidden="$emit('close')" size="" centered>
    <template #title> MSDAT Assistant Experimental</template>
    <template #default>
      <div class="voice-assistant-container p-3">
        <!-- Title and introduction -->
        <div class="text-center mb-4">
          <p class="">
            Hello! I’m your voice assistant, here to help you navigate dashboards, find indicators,
            and retrieve data or metadata from MSDAT.
          </p>
          <p>Just tell me what you need.</p>
        </div>

        <!-- Transcript display -->
        <div v-if="transcript" class="mb-4 p-3 bg-light rounded border">
          <p><strong>You said:</strong> {{ transcript }}</p>
        </div>

        <!-- Loading spinner -->
        <div v-if="status === 'processing'" class="mb-4 p-3 bg-light rounded border text-center">
          <div class="d-flex align-items-center justify-content-center">
            <div class="rolling-spinner mr-2"></div>
            <span>Processing your request...</span>
          </div>
          <b-button variant="outline-primary" size="sm" class="mt-2" @click="cancelRequest">
            Cancel
          </b-button>
        </div>

        <!-- Text response display -->
        <div v-if="textResponse" class="mb-4 p-3 bg-info-light rounded border">
          <p><strong>Assistant:</strong> {{ textResponse }}</p>
        </div>

        <!-- Microphone permission warning -->
        <b-alert
          :show="micPermission !== 'granted'"
          variant="warning"
          class="d-flex align-items-center mb-4"
        >
          <b-icon icon="info-circle-fill" class="mr-2"></b-icon>
          <span>
            {{
              micPermission === 'denied'
                ? 'Microphone access denied. Please enable microphone access in your browser settings.'
                : 'Microphone permission required. Click the button below to grant access.'
            }}
          </span>
        </b-alert>

        <!-- Browser compatibility warning -->
        <b-alert
          :show="!recognitionSupported"
          variant="danger"
          class="d-flex align-items-center mb-4"
        >
          <b-icon icon="exclamation-triangle-fill" class="mr-2"></b-icon>
          <span>
            Speech recognition is not supported in this browser. Please try Chrome, Edge, or Safari.
          </span>
        </b-alert>

        <!-- Microphone control -->
        <div class="mic-control text-center mb-4">
          <p class="mb-3">{{ statusText }}</p>
          <b-button
            :variant="micButtonVariant"
            class="rounded-circle mic-button d-flex align-items-center justify-content-center"
            :class="{ listening: isListening }"
            style="width: 80px; height: 80px"
            :disabled="!recognitionSupported || status === 'processing'"
            @click="micPermission !== 'granted' ? requestMicrophoneAccess() : toggleListening()"
          >
            <b-icon
              :icon="isListening ? 'stop-fill' : 'mic-fill'"
              font-scale="2"
              class="text-white"
            ></b-icon>
          </b-button>
          <small class="text-muted mt-2 d-block">
            {{ isListening ? 'Click to stop' : 'Click to start speaking' }}
          </small>

          <!-- Sound wave animation -->
          <div v-if="isListening" class="sound-wave d-flex justify-content-center mt-3">
            <span class="wave-bar"></span>
            <span class="wave-bar"></span>
            <span class="wave-bar"></span>
            <span class="wave-bar"></span>
            <span class="wave-bar"></span>
          </div>
        </div>

        <!-- Test API button -->
        <div class="my-4">
          <b-button variant="light" block @click="testAPIDirectly">
            Test API with Sample Command
          </b-button>
        </div>

        <!-- Debug information panel -->
        <div class="mt-4 border-top pt-3">
          <details>
            <summary class="cursor-pointer">Debug Information</summary>
            <div
              class="mt-2 bg-light p-2 rounded border"
              style="max-height: 150px; overflow-y: auto"
            >
              <div v-if="debugInfo.length === 0">
                <p>No debug information available</p>
              </div>
              <div v-else>
                <div v-for="(info, index) in debugInfo" :key="index" class="mb-1">
                  {{ info }}
                </div>
              </div>
            </div>
          </details>
        </div>

        <!-- Audio element -->
        <audio
          ref="audioRef"
          controls
          class="mt-4 w-100"
          @error="(e) => addDebugInfo(`Audio error: ${e.target.error?.message || 'Unknown error'}`)"
          @play="() => addDebugInfo('Audio started playing')"
          @pause="() => addDebugInfo('Audio paused')"
          @ended="() => addDebugInfo('Audio playback completed')"
        >
          Your browser does not support the audio element.
        </audio>
      </div>
    </template>
  </BaseModal>
</template>

<script>
import BaseModal from '@/components/ui-components/_base-modal.vue'; // Adjust path if necessary
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';

export default {
  name: 'VoiceControlModal',
  components: {
    BaseModal,
  },
  props: {
    show: {
      type: Boolean,
      default: false,
    },
  },
  setup(props, { emit }) {
    // Add this function at the start of the setup function, before other declarations
    const sanitizeJsonResponse = (text) => {
      try {
        // First try parsing as-is
        return JSON.parse(text);
      } catch (e) {
        // If that fails, try to fix common issues with the response
        const cleanText = text.replace(/"\s*"([^"]+)"\s*"/, '"$1"'); // Remove double quotes around string values
        return JSON.parse(cleanText);
      }
    };

    const isListening = ref(false);
    const transcript = ref('');
    const interimTranscript = ref(''); // For showing real-time transcription
    const finalTranscript = ref(''); // Accumulated final results
    const manualStop = ref(false); // Track if user manually stopped
    const textResponse = ref(''); // Added for text response
    const status = ref('idle'); // idle, listening, processing, response
    const audioUrl = ref(null);
    const audioRef = ref(null);
    const recognitionRef = ref(null);
    const debugInfo = ref([]);
    const micPermission = ref('prompt'); // granted, denied, prompt
    const recognitionSupported = ref(true);
    const abortController = ref(null); // For cancelling API requests
    const listeningTimeout = ref(null); // For auto-stop timeout

    // Add this function to log debug information
    const addDebugInfo = (message) => {
      // console.log(message);
      debugInfo.value.push(`${new Date().toLocaleTimeString()}: ${message}`);
    };

    // Process audio responses
    const processAudioResponse = (audioResponse) => {
      addDebugInfo(`Audio response URL received: ${audioResponse}`);
      audioUrl.value = audioResponse;
      status.value = 'response';
      // Play the audio
      if (audioRef.value) {
        addDebugInfo('Setting audio source and attempting to play...');
        audioRef.value.src = audioResponse;
        audioRef.value.load();
        audioRef.value.play().catch((error) => {
          addDebugInfo(`Error playing audio: ${error.message}`);
        });
        addDebugInfo('Audio playback initiated');
      } else {
        addDebugInfo('Audio element reference is null');
      }
    };

    // Cancel ongoing API request
    const cancelRequest = () => {
      if (abortController.value) {
        abortController.value.abort();
        abortController.value = null;
      }
      status.value = 'idle';
      addDebugInfo('Request cancelled by user');
    };

    // Send command to API
    const sendCommandToAPI = async (command) => {
      addDebugInfo(`Preparing to send command to API: "${command}"`);
      const payload = JSON.stringify({ command });
      addDebugInfo(`API request payload: ${payload}`);
      textResponse.value = ''; // Clear previous text response

      // Create new AbortController for this request
      abortController.value = new AbortController();

      try {
        addDebugInfo('Sending request to API endpoint...');

        const response = await fetch(
          'https://n8n.e4eweb.space/webhook/9ddd74ac-f821-45c9-a341-357971c5e359',
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: payload,
            signal: abortController.value.signal,
          }
        );

        const responseText = await response.text();

        addDebugInfo(`API response status: ${response.status}`);
        addDebugInfo('--- BEGIN RAW API RESPONSE TEXT ---');
        addDebugInfo(responseText);
        addDebugInfo('--- END RAW API RESPONSE TEXT ---');

        if (!response.ok) {
          throw new Error(
            `API request failed with status ${response.status}. Response: ${responseText}`
          );
        }

        // ✅ Try to parse JSON
        let data;
        try {
          data = JSON.parse(responseText);
        } catch (err) {
          addDebugInfo(`Error parsing JSON: ${err.message}`);
          throw new Error(`Failed to parse response: ${err.message}`);
        }

        // console.log(data, '@@@ NAVigation');

        // ✅ Handle navigation type
        if (data?.type === 'Navigation' && data?.route) {
          addDebugInfo(`Navigation detected — redirecting to ${data.route}`);

          const rawRoute = data.route.trim();

          let targetUrl;

          try {
            // Try to construct URL directly (handles full URLs correctly)
            const parsedUrl = new URL(rawRoute);

            // If it's already a valid absolute URL, use it directly
            targetUrl = parsedUrl.href;
          } catch {
            // If it fails, it's a relative path — build from origin
            const cleanPath = rawRoute.replace(/^\/+/, '');
            targetUrl = new URL(cleanPath, window.location.origin).href;
          }

          addDebugInfo(`Final navigation URL: ${targetUrl}`);

          window.location.assign(targetUrl);
          return;
        }
        // ✅ Continue normal response flow
        addDebugInfo(`API response data: ${JSON.stringify(data)}`);

        if (data.text_response) {
          textResponse.value = data.text_response;
          addDebugInfo(`Text response received: ${data.text_response}`);
        }

        if (data.audio_response) {
          processAudioResponse(data.audio_response);
        } else {
          addDebugInfo('No audio response in API response');
          if (!data.text_response) status.value = 'idle';
        }
      } catch (error) {
        if (error.name === 'AbortError') {
          addDebugInfo('Request was aborted');
          return;
        }
        const errorMessage = error instanceof Error ? error.message : String(error);
        // console.error('Error in sendCommandToAPI:', errorMessage);
        addDebugInfo(`API call failed: ${errorMessage}`);
        status.value = 'idle';
      } finally {
        abortController.value = null;
      }
    };

    // Initialize speech recognition
    const initializeSpeechRecognition = () => {
      addDebugInfo('Initializing speech recognition...');
      if (typeof window !== 'undefined') {
        // Check if SpeechRecognition is available
        const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognitionAPI) {
          addDebugInfo('Speech recognition API is available');
          recognitionRef.value = new SpeechRecognitionAPI();
          // Configure the recognition for better accuracy
          recognitionRef.value.continuous = true; // Keep listening until manually stopped
          recognitionRef.value.interimResults = true; // Show results as user speaks
          recognitionRef.value.maxAlternatives = 3; // Get multiple alternatives for better accuracy
          recognitionRef.value.lang = 'en-US';

          // Set up event handlers
          recognitionRef.value.onstart = () => {
            addDebugInfo('Speech recognition started');
            isListening.value = true;
          };

          recognitionRef.value.onresult = (event) => {
            let interim = '';
            let final = finalTranscript.value;

            // Process all results
            for (let i = event.resultIndex; i < event.results.length; i++) {
              const result = event.results[i];
              const transcriptText = result[0].transcript;
              const confidence = result[0].confidence;

              if (result.isFinal) {
                // Log alternatives for debugging
                if (result.length > 1) {
                  const alternatives = Array.from(result)
                    .map(
                      (alt, idx) =>
                        `Alt ${idx + 1}: "${alt.transcript}" (${(alt.confidence * 100).toFixed(
                          1
                        )}%)`
                    )
                    .join(', ');
                  addDebugInfo(`Alternatives: ${alternatives}`);
                }

                final += `${transcriptText} `;
                addDebugInfo(
                  `Final result: "${transcriptText}" (confidence: ${(confidence * 100).toFixed(
                    1
                  )}%)`
                );
              } else {
                interim += transcriptText;
              }
            }

            finalTranscript.value = final;
            interimTranscript.value = interim;

            // Update display transcript (final + interim)
            transcript.value = (final + interim).trim();
            addDebugInfo(`Current transcript: "${transcript.value}"`);
          };

          recognitionRef.value.onspeechend = () => {
            addDebugInfo('Speech ended (silence detected)');
          };

          recognitionRef.value.onerror = (event) => {
            addDebugInfo(`Speech recognition error: ${event.error}`);

            // Handle specific errors
            if (event.error === 'no-speech') {
              addDebugInfo('No speech detected - continuing to listen...');
              // Don't stop on no-speech, let user keep trying
              return;
            }

            if (event.error === 'aborted') {
              addDebugInfo('Recognition aborted');
              return;
            }

            if (event.error === 'network') {
              addDebugInfo('Network error - check your connection');
            }

            isListening.value = false;
            status.value = 'idle';
          };

          recognitionRef.value.onend = () => {
            addDebugInfo(
              `Speech recognition ended. Manual stop: ${manualStop.value}, isListening: ${isListening.value}`
            );

            // If user manually stopped, process the transcript
            if (manualStop.value) {
              manualStop.value = false;
              isListening.value = false;

              const fullTranscript = finalTranscript.value.trim();
              if (fullTranscript) {
                addDebugInfo(`Processing final transcript: "${fullTranscript}"`);
                transcript.value = fullTranscript;
                status.value = 'processing';
                sendCommandToAPI(fullTranscript);
                emit('command', fullTranscript);
              } else {
                addDebugInfo('No transcript to process');
                status.value = 'idle';
              }
            }
            // If recognition ended but user didn't stop, restart it
            else if (isListening.value && status.value === 'listening') {
              addDebugInfo('Recognition ended unexpectedly, restarting...');
              try {
                setTimeout(() => {
                  if (isListening.value && recognitionRef.value) {
                    recognitionRef.value.start();
                    addDebugInfo('Recognition restarted');
                  }
                }, 100);
              } catch (error) {
                addDebugInfo(`Error restarting recognition: ${error}`);
                isListening.value = false;
                status.value = 'idle';
              }
            } else {
              isListening.value = false;
              if (status.value === 'listening') {
                status.value = 'idle';
              }
            }
          };

          recognitionSupported.value = true;
        } else {
          addDebugInfo('Speech recognition is NOT supported in this browser');
          recognitionSupported.value = false;
        }
      }
    };

    // Check for microphone permissions
    const checkMicrophonePermission = async () => {
      try {
        addDebugInfo('Checking microphone permission...');
        const permissionStatus = await navigator.permissions.query({ name: 'microphone' });
        micPermission.value = permissionStatus.state;
        addDebugInfo(`Microphone permission status: ${permissionStatus.state}`);
        permissionStatus.onchange = () => {
          micPermission.value = permissionStatus.state;
          addDebugInfo(`Microphone permission changed to: ${permissionStatus.state}`);
        };
      } catch (error) {
        addDebugInfo(`Error checking microphone permission: ${error}`);
      }
    };

    // Request microphone access explicitly
    const requestMicrophoneAccess = async () => {
      try {
        addDebugInfo('Requesting microphone access...');
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        micPermission.value = 'granted';
        addDebugInfo('Microphone access granted');
        // Clean up the stream immediately since we just needed it for permissions
        stream.getTracks().forEach((track) => track.stop());
        // Initialize speech recognition after permission is granted
        initializeSpeechRecognition();
      } catch (error) {
        micPermission.value = 'denied';
        addDebugInfo(`Microphone access denied: ${error}`);
      }
    };

    // Toggle listening on/off
    const toggleListening = () => {
      if (isListening.value) {
        stopListening();
      } else {
        startListening();
      }
    };

    // Start listening function
    const startListening = () => {
      addDebugInfo('Starting to listen...');
      // Clear previous results
      transcript.value = '';
      finalTranscript.value = '';
      interimTranscript.value = '';
      manualStop.value = false;
      textResponse.value = ''; // Clear previous text response
      audioUrl.value = null;
      status.value = 'listening';
      // Check if we have microphone permission
      if (micPermission.value !== 'granted') {
        addDebugInfo('No microphone permission, requesting access...');
        requestMicrophoneAccess();
        return;
      }
      // Check if speech recognition is supported and initialized
      if (!recognitionSupported.value) {
        addDebugInfo('Speech recognition not supported in this browser');
        return;
      }
      if (!recognitionRef.value) {
        addDebugInfo('Speech recognition not initialized, initializing now...');
        initializeSpeechRecognition();
      }
      // Start recognition
      try {
        addDebugInfo('Attempting to start speech recognition');
        recognitionRef.value.start();

        // Auto-stop after 30 seconds to prevent endless listening
        listeningTimeout.value = setTimeout(() => {
          if (isListening.value) {
            addDebugInfo('Auto-stopping after 30 second timeout');
            stopListening();
          }
        }, 30000);
      } catch (error) {
        addDebugInfo(`Error starting speech recognition: ${error}`);
        // If already started, stop and restart
        if (error instanceof DOMException && error.name === 'InvalidStateError') {
          addDebugInfo('Recognition was already running, stopping and restarting');
          try {
            recognitionRef.value.stop();
            setTimeout(() => {
              recognitionRef.value.start();
            }, 100);
          } catch (stopError) {
            addDebugInfo(`Error stopping recognition: ${stopError}`);
          }
        }
      }
    };

    // Stop listening function
    const stopListening = () => {
      addDebugInfo('Stopping listening (manual stop)...');

      // Set manual stop flag so onend handler knows to process transcript
      manualStop.value = true;

      // Clear the auto-stop timeout
      if (listeningTimeout.value) {
        clearTimeout(listeningTimeout.value);
        listeningTimeout.value = null;
      }

      if (recognitionRef.value) {
        try {
          recognitionRef.value.stop();
          addDebugInfo('Speech recognition stop requested');
        } catch (error) {
          addDebugInfo(`Error stopping speech recognition: ${error}`);
          // If stop fails, still process what we have
          manualStop.value = false;
          isListening.value = false;
          const fullTranscript = finalTranscript.value.trim();
          if (fullTranscript) {
            transcript.value = fullTranscript;
            status.value = 'processing';
            sendCommandToAPI(fullTranscript);
            emit('command', fullTranscript);
          } else {
            status.value = 'idle';
          }
        }
      } else {
        addDebugInfo('Speech recognition not initialized');
        manualStop.value = false;
        isListening.value = false;
        status.value = 'idle';
      }
    };

    // Test API directly
    const testAPIDirectly = () => {
      const testCommand = 'Navigate me to health outcome dashboard';
      addDebugInfo(`Testing API with command: "${testCommand}"`);
      sendCommandToAPI(testCommand);
    };

    // Computed properties
    const micButtonVariant = computed(() => {
      if (isListening.value) return 'danger'; // Red when listening
      if (micPermission.value !== 'granted') return 'warning'; // Yellow if permission needed
      return 'primary'; // Green if granted and idle
    });
    const micButtonClass = computed(() => {
      if (isListening.value) {
        return 'bg-red-500 text-white';
      }
      if (micPermission.value !== 'granted') {
        return 'bg-yellow-500 text-white hover:bg-yellow-600 focus:ring-yellow-400';
      }
      return 'bg-yellow-500 text-white hover:bg-yellow-600 focus:ring-yellow-400';
    });

    const statusText = computed(() => {
      if (isListening.value) {
        return 'Listening... Speak now';
      }
      if (status.value === 'processing') {
        return 'Processing your request...';
      }
      if (status.value === 'response') {
        return 'Playing response...';
      }
      if (micPermission.value !== 'granted') {
        return 'Click the microphone to grant access';
      }
      return 'Click the microphone to start speaking';
    });

    // Lifecycle hooks
    onMounted(() => {
      addDebugInfo('Voice assistant component mounted');
      checkMicrophonePermission();
      // Check if speech recognition is supported
      if (typeof window !== 'undefined') {
        const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognitionAPI) {
          addDebugInfo('Speech recognition is NOT supported in this browser');
          recognitionSupported.value = false;
        } else {
          addDebugInfo('Speech recognition API is available');
          // Only initialize if we already have microphone permission
          if (micPermission.value === 'granted') {
            initializeSpeechRecognition();
          }
        }
      }
    });

    onBeforeUnmount(() => {
      addDebugInfo('Cleaning up voice assistant...');

      // Clear any pending timeouts
      if (listeningTimeout.value) {
        clearTimeout(listeningTimeout.value);
      }

      // Cancel any pending API requests
      if (abortController.value) {
        abortController.value.abort();
      }

      if (recognitionRef.value) {
        try {
          recognitionRef.value.abort();
        } catch (error) {
          addDebugInfo(`Error aborting recognition: ${error}`);
        }
      }
      if (audioRef.value) {
        audioRef.value.pause();
      }
      emit('close');
    });

    return {
      isListening,
      transcript,
      textResponse,
      status,
      audioUrl,
      audioRef,
      debugInfo,
      micPermission,
      recognitionSupported,
      micButtonVariant,
      micButtonClass,
      statusText,
      startListening,
      stopListening,
      toggleListening,
      cancelRequest,
      requestMicrophoneAccess,
      testAPIDirectly,
      addDebugInfo,
    };
  },
};
</script>

<style scoped>
/* Mic button base styles */
.mic-button {
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
}

.mic-button:hover:not(:disabled) {
  transform: scale(1.05);
}

.mic-button:active:not(:disabled) {
  transform: scale(0.95);
  filter: brightness(90%);
}

.mic-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Pulsing animation when listening */
.mic-button.listening {
  animation: pulse 1.5s ease-in-out infinite;
}

@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(220, 53, 69, 0.7);
  }
  70% {
    box-shadow: 0 0 0 20px rgba(220, 53, 69, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(220, 53, 69, 0);
  }
}

/* Sound wave animation */
.sound-wave {
  gap: 4px;
  height: 30px;
  align-items: center;
}

.wave-bar {
  width: 4px;
  height: 10px;
  background-color: #dc3545;
  border-radius: 2px;
  animation: wave 0.5s ease-in-out infinite;
}

.wave-bar:nth-child(1) {
  animation-delay: 0s;
}
.wave-bar:nth-child(2) {
  animation-delay: 0.1s;
}
.wave-bar:nth-child(3) {
  animation-delay: 0.2s;
}
.wave-bar:nth-child(4) {
  animation-delay: 0.3s;
}
.wave-bar:nth-child(5) {
  animation-delay: 0.4s;
}

@keyframes wave {
  0%,
  100% {
    height: 10px;
  }
  50% {
    height: 25px;
  }
}

.mic-control {
  margin-top: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
}

.voice-assistant-container p {
  margin: 0;
  font-size: 0.9rem;
}

.bg-info-light {
  background-color: #e6f7ff;
}

/* Rolling spinner animation */
.rolling-spinner {
  width: 20px;
  height: 20px;
  border: 2px solid #f3f3f3;
  border-top: 2px solid #007bff;
  border-radius: 50%;
  animation: roll 1s linear infinite;
}

@keyframes roll {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
