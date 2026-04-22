<template>
  <BaseModal
    :showModal="show"
    :noCloseOnBackdrop="true"
    :noCloseOnEsc="true"
    @hidden="$emit('close')"
    size="lg"
  >
    <template #title>
      <div class="voice-modal-title">
        <span class="voice-modal-eyebrow">MSDAT Assistant</span>
        <span class="voice-modal-heading">Voice Control</span>
      </div>
    </template>
    <template #default>
      <div class="voice-assistant-shell">
        <section class="voice-hero-card">
          <div class="hero-copy">
            <span class="hero-pill">Experimental</span>
            <h2>Your hands-free copilot for MSDAT</h2>
            <p>
              Navigate dashboards, surface indicators, and retrieve metadata with a single spoken
              request.
            </p>
          </div>

          <div class="hero-status" :class="`theme-${statusTheme}`">
            <div class="status-chip">
              <span class="status-dot"></span>
              {{ statusLabel }}
            </div>
            <p>{{ statusText }}</p>
          </div>
        </section>

        <section class="voice-control-card">
          <div class="voice-stage">
            <div class="mic-aura" :class="{ active: isListening }"></div>
            <b-button
              :variant="micButtonVariant"
              class="rounded-circle mic-button d-flex align-items-center justify-content-center"
              :class="{ listening: isListening }"
              :disabled="!recognitionSupported || status === 'processing'"
              @click="micPermission !== 'granted' ? requestMicrophoneAccess() : toggleListening()"
            >
              <b-icon
                :icon="isListening ? 'stop-fill' : 'mic-fill'"
                font-scale="1.8"
                class="text-white"
              ></b-icon>
            </b-button>

            <div v-if="isListening" class="sound-wave d-flex justify-content-center mt-3">
              <span class="wave-bar"></span>
              <span class="wave-bar"></span>
              <span class="wave-bar"></span>
              <span class="wave-bar"></span>
              <span class="wave-bar"></span>
            </div>
          </div>

          <div class="voice-actions">
            <p class="action-label">{{ isListening ? 'Tap to stop capture' : listeningHint }}</p>

            <div class="suggested-prompts">
              <button
                v-for="prompt in suggestedPrompts"
                :key="prompt"
                type="button"
                class="prompt-chip"
                :disabled="status === 'processing'"
                @click="runSuggestedPrompt(prompt)"
              >
                {{ prompt }}
              </button>
            </div>
          </div>
        </section>

        <section v-if="micPermission !== 'granted' || !recognitionSupported" class="info-grid">
          <div v-if="micPermission !== 'granted'" class="info-card" :class="permissionTone">
            <div class="info-card-icon">
              <b-icon icon="info-circle-fill"></b-icon>
            </div>
            <div>
              <h3>Microphone access</h3>
              <p>
                {{
                  micPermission === 'denied'
                    ? 'Microphone access is blocked. Enable it in your browser settings to use voice control.'
                    : 'Microphone permission is required before the assistant can start listening.'
                }}
              </p>
            </div>
          </div>

          <div v-if="!recognitionSupported" class="info-card danger">
            <div class="info-card-icon">
              <b-icon icon="exclamation-triangle-fill"></b-icon>
            </div>
            <div>
              <h3>Browser support</h3>
              <p>Speech recognition works best in recent versions of Chrome, Edge, or Safari.</p>
            </div>
          </div>
        </section>

        <section
          v-if="transcript || assistantMessage || status === 'processing'"
          class="response-grid"
        >
          <article v-if="transcript" class="response-card glass-card">
            <div class="response-label">Captured Request</div>
            <p>{{ transcript }}</p>
          </article>

          <article v-if="status === 'processing'" class="response-card processing-card">
            <div class="response-label">Assistant is thinking</div>
            <div class="processing-row">
              <div class="rolling-spinner"></div>
              <p>Processing your request and preparing a response.</p>
            </div>
            <b-button variant="outline-light" size="sm" class="cancel-button" @click="cancelRequest">
              Cancel request
            </b-button>
          </article>

          <article v-if="assistantMessage" class="response-card assistant-card">
            <div class="response-label">Assistant Response</div>
            <p class="assistant-message">
              {{ assistantMessage }}<span v-if="isTypingIntro" class="typing-cursor">|</span>
            </p>
          </article>
        </section>

        <section class="secondary-actions">
          <b-button variant="light" class="test-button" @click="testAPIDirectly">
            Try sample command
          </b-button>
        </section>

        <section v-show="audioUrl" class="audio-card">
          <div class="response-label">Audio playback</div>
          <audio
            ref="audioRef"
            controls
            class="w-100"
            @error="(e) => addDebugInfo(`Audio error: ${e.target.error?.message || 'Unknown error'}`)"
            @play="() => addDebugInfo('Audio started playing')"
            @pause="() => addDebugInfo('Audio paused')"
            @ended="() => addDebugInfo('Audio playback completed')"
          >
            Your browser does not support the audio element.
          </audio>
        </section>

        <section class="debug-card">
          <details>
            <summary>Debug Information</summary>
            <div class="debug-log">
              <div v-if="debugInfo.length === 0" class="debug-empty">No debug information available</div>
              <div v-else>
                <div v-for="(info, index) in debugInfo" :key="index" class="debug-item">
                  {{ info }}
                </div>
              </div>
            </div>
          </details>
        </section>
      </div>
    </template>
  </BaseModal>
</template>

<script>
import BaseModal from '@/components/ui-components/_base-modal.vue';
import store from '@/store';
import {
  ref, computed, onMounted, onBeforeUnmount, watch,
} from 'vue';

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
    const sanitizeJsonResponse = (text) => {
      try {
        return JSON.parse(text);
      } catch {
        const cleanText = text.replace(/"\s*"([^"]+)"\s*"/, '"$1"');
        return JSON.parse(cleanText);
      }
    };

    const isListening = ref(false);
    const transcript = ref('');
    const interimTranscript = ref(''); // For showing real-time transcription
    const finalTranscript = ref(''); // Accumulated final results
    const manualStop = ref(false); // Track if user manually stopped
    const textResponse = ref(''); // Added for text response
    const introMessage = 'Hello 👋\nI\'m your voice assistant, here to help you navigate dashboards, find indicators, and retrieve data or metadata from MSDAT.\nJust tell me what you need.';
    const typedIntroMessage = ref('');
    const isTypingIntro = ref(false);
    const introTypingTimeout = ref(null);
    const status = ref('idle'); // idle, listening, processing, response
    const audioUrl = ref(null);
    const audioRef = ref(null);
    const recognitionRef = ref(null);
    const debugInfo = ref([]);
    const micPermission = ref('prompt'); // granted, denied, prompt
    const recognitionSupported = ref(true);
    const abortController = ref(null); // For cancelling API requests
    const listeningTimeout = ref(null); // For inactivity auto-stop timeout
    const stopReason = ref(null);
    const recoveryPending = ref(false);
    let sendCommandToAPI;
    let startListening;
    let stopListening;
    const suggestedPrompts = [
      'Open the health outcome dashboard',
      'Find maternal mortality indicators',
      'Show metadata for this chart',
    ];
    const MAX_LISTENING_DURATION = 30000;

    const clearIntroTypingTimeout = () => {
      if (introTypingTimeout.value) {
        clearTimeout(introTypingTimeout.value);
        introTypingTimeout.value = null;
      }
    };

    const startIntroTyping = () => {
      clearIntroTypingTimeout();
      typedIntroMessage.value = '';
      isTypingIntro.value = true;
      let currentIndex = 0;

      const typeNextCharacter = () => {
        if (!props.show) {
          clearIntroTypingTimeout();
          isTypingIntro.value = false;
          return;
        }

        if (currentIndex >= introMessage.length) {
          isTypingIntro.value = false;
          introTypingTimeout.value = null;
          return;
        }

        typedIntroMessage.value += introMessage[currentIndex];
        currentIndex += 1;
        introTypingTimeout.value = setTimeout(typeNextCharacter, 28);
      };

      typeNextCharacter();
    };

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

    const clearListeningTimeout = () => {
      if (listeningTimeout.value) {
        clearTimeout(listeningTimeout.value);
        listeningTimeout.value = null;
      }
    };

    const resetVoiceSession = () => {
      clearListeningTimeout();
      status.value = 'idle';
      isListening.value = false;
      stopReason.value = null;
      manualStop.value = false;
      recoveryPending.value = false;
    };

    const assistantMessage = computed(() => textResponse.value || typedIntroMessage.value);

    const normalizeText = (value) => value
      .toLowerCase()
      .replace(/[^\w\s-]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    const normalizeResponseType = (value) => (typeof value === 'string' ? normalizeText(value).replace(/\s+/g, '') : '');

    const getSectionTargetFromResponse = (data) => {
      if (!data || typeof data !== 'object') {
        return '';
      }

      const responseType = normalizeResponseType(data.type);
      const sectionTypes = ['section', 'internalsection', 'internalnavigation'];

      if (!sectionTypes.includes(responseType)) {
        return '';
      }

      return data.section || data.section_title || data.title || data.name || data.route || '';
    };

    const getNavigationTargetFromResponse = (data) => {
      if (!data || typeof data !== 'object') {
        return '';
      }

      return normalizeResponseType(data.type) === 'navigation' ? data.route : '';
    };

    function finalizeTranscriptProcessing() {
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

    function scheduleListeningTimeout() {
      clearListeningTimeout();

      listeningTimeout.value = setTimeout(() => {
        if (isListening.value || status.value === 'listening') {
          addDebugInfo('Auto-stopping after 30 seconds of inactivity');
          stopListening('timeout');
        }
      }, MAX_LISTENING_DURATION);
    }

    const restartRecognition = (reason = 'unexpected end') => {
      if (
        !recognitionRef.value
        || !recognitionSupported.value
        || manualStop.value
        || stopReason.value === 'timeout'
        || status.value !== 'listening'
      ) {
        return;
      }

      addDebugInfo(`Attempting recognition recovery after ${reason}`);
      recoveryPending.value = true;

      setTimeout(() => {
        try {
          if (
            recognitionRef.value
            && recognitionSupported.value
            && !manualStop.value
            && stopReason.value !== 'timeout'
            && status.value === 'listening'
          ) {
            recognitionRef.value.start();
            scheduleListeningTimeout();
            addDebugInfo('Recognition restarted');
          }
        } catch (error) {
          addDebugInfo(`Error restarting recognition: ${error}`);
          if (status.value === 'listening') {
            restartRecognition('restart failure');
          } else {
            isListening.value = false;
            recoveryPending.value = false;
          }
          return;
        }

        recoveryPending.value = false;
      }, 250);
    };

    // Send command to API
    sendCommandToAPI = async (command) => {
      addDebugInfo(`Preparing to send command to API: "${command}"`);
      const payload = JSON.stringify({ command });
      addDebugInfo(`API request payload: ${payload}`);
      clearIntroTypingTimeout();
      isTypingIntro.value = false;
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
          },
        );

        const responseText = await response.text();

        addDebugInfo(`API response status: ${response.status}`);
        addDebugInfo('--- BEGIN RAW API RESPONSE TEXT ---');
        addDebugInfo(responseText);
        addDebugInfo('--- END RAW API RESPONSE TEXT ---');

        if (!response.ok) {
          throw new Error(
            `API request failed with status ${response.status}. Response: ${responseText}`,
          );
        }

        // ✅ Try to parse JSON
        let data;
        try {
          data = JSON.parse(responseText);
        } catch (err) {
          addDebugInfo(`Error parsing JSON: ${err.message}`);
          try {
            data = sanitizeJsonResponse(responseText);
            addDebugInfo('Recovered API response with fallback JSON sanitization');
          } catch {
            throw new Error(`Failed to parse response: ${err.message}`);
          }
        }

        // console.log(data, '@@@ NAVigation');

        // ✅ Handle navigation type
        const navigationTarget = getNavigationTargetFromResponse(data);
        if (navigationTarget) {
          addDebugInfo(`Navigation detected — redirecting to ${navigationTarget}`);

          const rawRoute = navigationTarget.trim();

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
          addDebugInfo('Opening navigation target in a new tab');

          window.open(targetUrl, '_blank', 'noopener,noreferrer');
          resetVoiceSession();
          emit('close');
          return;
        }

        const targetSection = getSectionTargetFromResponse(data);
        if (targetSection) {
          addDebugInfo(`Internal section switch detected — moving to ${targetSection}`);

          store.commit('MSDAT_STORE/SET_SECTION', targetSection);
          resetVoiceSession();
          emit('close');
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
            recoveryPending.value = false;
            scheduleListeningTimeout();
          };

          recognitionRef.value.onspeechstart = () => {
            addDebugInfo('Speech detected');
            scheduleListeningTimeout();
          };

          recognitionRef.value.onsoundstart = () => {
            addDebugInfo('Sound detected');
            scheduleListeningTimeout();
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
                      (alt, idx) => `Alt ${idx + 1}: "${alt.transcript}" (${(alt.confidence * 100).toFixed(
                        1,
                      )}%)`,
                    )
                    .join(', ');
                  addDebugInfo(`Alternatives: ${alternatives}`);
                }

                final += `${transcriptText} `;
                addDebugInfo(
                  `Final result: "${transcriptText}" (confidence: ${(confidence * 100).toFixed(
                    1,
                  )}%)`,
                );
              } else {
                interim += transcriptText;
              }
            }

            finalTranscript.value = final;
            interimTranscript.value = interim;

            // Update display transcript (final + interim)
            transcript.value = (final + interim).trim();
            scheduleListeningTimeout();
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
              restartRecognition('no-speech');
              return;
            }

            if (event.error === 'aborted') {
              addDebugInfo('Recognition aborted');
              if (!manualStop.value && stopReason.value !== 'timeout' && status.value === 'listening') {
                restartRecognition('aborted');
              }
              return;
            }

            if (event.error === 'network') {
              addDebugInfo('Network error - check your connection');
              restartRecognition('network error');
              return;
            }

            if (event.error === 'audio-capture') {
              addDebugInfo('Audio capture failed - microphone may be unavailable');
              restartRecognition('audio-capture');
              return;
            }

            if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
              addDebugInfo('Microphone or speech recognition permission not allowed');
              micPermission.value = 'denied';
              isListening.value = false;
              status.value = 'idle';
              return;
            }

            addDebugInfo('Recoverable speech recognition error encountered');
            restartRecognition(event.error);
          };

          recognitionRef.value.onend = () => {
            addDebugInfo(
              `Speech recognition ended. Manual stop: ${manualStop.value}, isListening: ${isListening.value}`,
            );

            // If user manually stopped, process the transcript
            if (manualStop.value || stopReason.value === 'timeout') {
              manualStop.value = false;
              isListening.value = false;
              stopReason.value = null;
              finalizeTranscriptProcessing();
            } else if (isListening.value && status.value === 'listening') {
              // If recognition ended but user didn't stop, restart it
              addDebugInfo('Recognition ended unexpectedly, restarting...');
              restartRecognition('unexpected end');
            } else {
              isListening.value = false;
              stopReason.value = null;
              recoveryPending.value = false;
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
    startListening = () => {
      addDebugInfo('Starting to listen...');
      clearIntroTypingTimeout();
      isTypingIntro.value = false;
      // Clear previous results
      transcript.value = '';
      finalTranscript.value = '';
      interimTranscript.value = '';
      manualStop.value = false;
      stopReason.value = null;
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
        scheduleListeningTimeout();
      } catch (error) {
        addDebugInfo(`Error starting speech recognition: ${error}`);
        // If already started, stop and restart
        if (error instanceof DOMException && error.name === 'InvalidStateError') {
          addDebugInfo('Recognition was already running, stopping and restarting');
          try {
            recognitionRef.value.stop();
            setTimeout(() => {
              recognitionRef.value.start();
              scheduleListeningTimeout();
            }, 100);
          } catch (stopError) {
            addDebugInfo(`Error stopping recognition: ${stopError}`);
          }
        }
      }
    };

    // Stop listening function
    stopListening = (reason = 'manual') => {
      addDebugInfo(`Stopping listening (${reason} stop)...`);

      stopReason.value = reason;
      manualStop.value = reason === 'manual';
      recoveryPending.value = false;

      clearListeningTimeout();

      if (recognitionRef.value) {
        try {
          recognitionRef.value.stop();
          addDebugInfo('Speech recognition stop requested');
        } catch (error) {
          addDebugInfo(`Error stopping speech recognition: ${error}`);
          // If stop fails, still process what we have
          manualStop.value = false;
          isListening.value = false;
          stopReason.value = null;
          finalizeTranscriptProcessing();
        }
      } else {
        addDebugInfo('Speech recognition not initialized');
        manualStop.value = false;
        isListening.value = false;
        stopReason.value = null;
        status.value = 'idle';
      }
    };

    // Test API directly
    const testAPIDirectly = () => {
      const testCommand = 'Navigate me to health outcome dashboard';
      addDebugInfo(`Testing API with command: "${testCommand}"`);
      sendCommandToAPI(testCommand);
    };

    const runSuggestedPrompt = (prompt) => {
      clearIntroTypingTimeout();
      isTypingIntro.value = false;
      transcript.value = prompt;
      finalTranscript.value = prompt;
      interimTranscript.value = '';
      addDebugInfo(`Running suggested prompt: "${prompt}"`);
      status.value = 'processing';
      sendCommandToAPI(prompt);
      emit('command', prompt);
    };

    // Computed properties
    const micButtonVariant = computed(() => {
      if (isListening.value) return 'danger'; // Red when listening
      if (micPermission.value !== 'granted') return 'warning'; // Yellow if permission needed
      return 'primary'; // Green if granted and idle
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

    const statusLabel = computed(() => {
      if (isListening.value) return 'Live Listening';
      if (status.value === 'processing') return 'Processing';
      if (status.value === 'response') return 'Response Ready';
      if (micPermission.value !== 'granted') return 'Permission Needed';
      return 'Ready';
    });

    const statusTheme = computed(() => {
      if (isListening.value) return 'listening';
      if (status.value === 'processing') return 'processing';
      if (status.value === 'response') return 'response';
      if (micPermission.value !== 'granted') return 'warning';
      return 'idle';
    });

    const listeningHint = computed(() => {
      if (micPermission.value !== 'granted') return 'Enable microphone access';
      return 'Start speaking';
    });

    const permissionTone = computed(() => (micPermission.value === 'denied' ? 'danger' : 'warning'));

    watch(
      () => props.show,
      (isVisible) => {
        if (isVisible) {
          startIntroTyping();
          return;
        }

        clearIntroTypingTimeout();
        isTypingIntro.value = false;
        typedIntroMessage.value = '';
      },
      { immediate: true },
    );

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
      clearListeningTimeout();
      clearIntroTypingTimeout();

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
    });

    return {
      isListening,
      transcript,
      textResponse,
      assistantMessage,
      isTypingIntro,
      status,
      audioUrl,
      audioRef,
      debugInfo,
      micPermission,
      recognitionSupported,
      micButtonVariant,
      statusText,
      statusLabel,
      statusTheme,
      listeningHint,
      permissionTone,
      suggestedPrompts,
      startListening,
      stopListening,
      toggleListening,
      cancelRequest,
      requestMicrophoneAccess,
      testAPIDirectly,
      runSuggestedPrompt,
      addDebugInfo,
    };
  },
};
</script>

<style scoped>
.voice-modal-title {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.voice-modal-eyebrow {
  color: #007d53;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.voice-modal-heading {
  color: #112a24;
  font-size: 1.05rem;
  font-weight: 700;
}

.voice-assistant-shell {
  padding: 0.35rem;
  color: #17322c;
}

.voice-hero-card,
.voice-control-card,
.response-card,
.audio-card,
.debug-card {
  border-radius: 24px;
}

.voice-hero-card {
  position: relative;
  overflow: hidden;
  display: flex;
  justify-content: space-between;
  gap: 1.5rem;
  padding: 1.5rem;
  margin-bottom: 1rem;
  background:
    radial-gradient(circle at top left, rgba(255, 255, 255, 0.28), transparent 36%),
    linear-gradient(135deg, #0d4d44 0%, #12715f 55%, #d4a64b 140%);
  color: #fffdf7;
}

.hero-copy {
  max-width: 420px;
}

.hero-copy h2 {
  margin: 0 0 0.55rem;
  font-size: 1.8rem;
  font-weight: 700;
  line-height: 1.15;
}

.hero-copy p {
  margin: 0;
  font-size: 0.98rem;
  line-height: 1.6;
  color: rgba(255, 253, 247, 0.84);
}

.hero-pill,
.status-chip,
.response-label {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  border-radius: 999px;
  font-size: 0.73rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.assistant-message {
  white-space: pre-line;
  font-family: 'Georgia', 'Times New Roman', serif;
  font-size: 1.08rem;
  line-height: 1.85;
  letter-spacing: 0.01em;
  color: #14362f;
}

.typing-cursor {
  display: inline-block;
  margin-left: 0.08rem;
  font-weight: 600;
  animation: cursor-blink 1s steps(1) infinite;
}

@keyframes cursor-blink {
  50% {
    opacity: 0;
  }
}

.hero-pill {
  padding: 0.45rem 0.8rem;
  margin-bottom: 0.9rem;
  background: rgba(255, 255, 255, 0.14);
  border: 1px solid rgba(255, 255, 255, 0.22);
}

.hero-status {
  min-width: 205px;
  align-self: flex-start;
  padding: 1rem;
  border-radius: 20px;
  backdrop-filter: blur(14px);
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.18);
}

.hero-status p {
  margin: 0.75rem 0 0;
  font-size: 0.92rem;
  line-height: 1.5;
  color: rgba(255, 253, 247, 0.88);
}

.status-chip {
  padding: 0.45rem 0.7rem;
  color: #fff;
  background: rgba(255, 255, 255, 0.12);
}

.status-dot {
  width: 0.55rem;
  height: 0.55rem;
  border-radius: 50%;
  background: currentColor;
  box-shadow: 0 0 0 4px rgba(255, 255, 255, 0.12);
}

.theme-warning .status-chip {
  color: #ffe08a;
}

.theme-listening .status-chip {
  color: #ffc1c8;
}

.theme-processing .status-chip {
  color: #d6f5ee;
}

.theme-response .status-chip {
  color: #f8ddb1;
}

.theme-idle .status-chip {
  color: #ffffff;
}

.voice-control-card {
  position: relative;
  overflow: hidden;
  display: grid;
  grid-template-columns: minmax(220px, 260px) 1fr;
  gap: 1.25rem;
  padding: 1.4rem;
  margin-bottom: 1rem;
  background:
    linear-gradient(180deg, rgba(245, 249, 248, 0.96), rgba(232, 241, 238, 0.95)),
    #ffffff;
  border: 1px solid rgba(17, 42, 36, 0.08);
  box-shadow: 0 20px 50px rgba(10, 42, 35, 0.08);
}

.voice-stage {
  position: relative;
  min-height: 230px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.mic-aura {
  position: absolute;
  width: 180px;
  height: 180px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(18, 113, 95, 0.18), rgba(18, 113, 95, 0.02) 70%);
  transform: scale(0.92);
  transition: transform 0.3s ease, opacity 0.3s ease;
}

.mic-aura.active {
  transform: scale(1.06);
  opacity: 1;
}

.mic-button {
  position: relative;
  z-index: 1;
  width: 96px;
  height: 96px;
  border: 0;
  transition: transform 0.3s ease, box-shadow 0.3s ease, filter 0.3s ease;
  box-shadow: 0 18px 38px rgba(18, 113, 95, 0.28);
}

.mic-button:hover:not(:disabled) {
  transform: translateY(-2px) scale(1.03);
}

.mic-button:active:not(:disabled) {
  transform: scale(0.97);
}

.mic-button:disabled {
  opacity: 0.55;
  cursor: not-allowed;
  box-shadow: none;
}

.mic-button.listening {
  animation: pulse 1.5s ease-in-out infinite;
}

.voice-actions {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 1rem;
}

.action-label {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: #17322c;
}

.suggested-prompts {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.prompt-chip {
  padding: 0.72rem 1rem;
  border: 1px solid rgba(18, 113, 95, 0.14);
  border-radius: 16px;
  background: #ffffff;
  color: #17322c;
  font-size: 0.92rem;
  line-height: 1.35;
  text-align: left;
  box-shadow: 0 10px 22px rgba(17, 42, 36, 0.05);
  transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease;
}

.prompt-chip:hover:enabled {
  transform: translateY(-2px);
  border-color: rgba(18, 113, 95, 0.3);
  box-shadow: 0 16px 28px rgba(17, 42, 36, 0.09);
}

.prompt-chip:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.info-grid,
.response-grid {
  display: grid;
  gap: 1rem;
  margin-bottom: 1rem;
}

.info-card {
  display: flex;
  gap: 1rem;
  padding: 1.1rem 1.2rem;
  border-radius: 20px;
  border: 1px solid transparent;
}

.info-card.warning {
  background: #fff8e7;
  border-color: #f2d58b;
}

.info-card.danger {
  background: #fff0ee;
  border-color: #f1b8b2;
}

.info-card h3 {
  margin: 0 0 0.35rem;
  font-size: 0.98rem;
  font-weight: 700;
}

.info-card p {
  margin: 0;
  line-height: 1.5;
  color: #4a615b;
}

.info-card-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 42px;
  height: 42px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.6);
  font-size: 1.1rem;
}

.response-grid {
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
}

.response-card,
.audio-card,
.debug-card {
  padding: 1.15rem;
  border: 1px solid rgba(17, 42, 36, 0.08);
  background: #ffffff;
}

.glass-card {
  background: linear-gradient(180deg, #f7fbfa, #f1f7f5);
}

.assistant-card {
  background: linear-gradient(180deg, #f4fbf8, #eaf5f1);
  border: 1px solid rgba(18, 113, 95, 0.14);
  box-shadow: 0 18px 36px rgba(13, 77, 68, 0.08);
}

.assistant-card .response-label {
  margin-bottom: 0.7rem;
  background: rgba(18, 113, 95, 0.08);
  color: #0d4d44;
  padding: 0.38rem 0.72rem;
}

.processing-card {
  color: #fff;
  background: linear-gradient(135deg, #0f3d36, #155d4f);
}

.response-label {
  padding: 0.35rem 0.65rem;
  margin-bottom: 0.85rem;
  color: #0d5b4f;
  background: rgba(18, 113, 95, 0.1);
}

.processing-card .response-label {
  color: #ffffff;
  background: rgba(255, 255, 255, 0.12);
}

.response-card p,
.audio-card p {
  margin: 0;
  line-height: 1.6;
}

.processing-row {
  display: flex;
  align-items: center;
  gap: 0.8rem;
}

.cancel-button,
.test-button {
  min-height: 44px;
  border-radius: 14px;
}

.secondary-actions {
  margin-bottom: 1rem;
}

.test-button {
  width: 100%;
  border-color: rgba(18, 113, 95, 0.12);
  background: #fbfcfc;
  color: #17322c;
  font-weight: 600;
}

.audio-card audio {
  border-radius: 12px;
}

.debug-card summary {
  cursor: pointer;
  font-weight: 700;
  color: #17322c;
}

.debug-log {
  max-height: 180px;
  margin-top: 0.85rem;
  padding: 0.95rem;
  overflow-y: auto;
  border-radius: 16px;
  background: #f6f9f8;
  border: 1px solid rgba(17, 42, 36, 0.08);
}

.debug-empty,
.debug-item {
  font-size: 0.88rem;
  line-height: 1.5;
  color: #4a615b;
}

.debug-item + .debug-item {
  margin-top: 0.45rem;
}

.sound-wave {
  gap: 4px;
  height: 30px;
  align-items: center;
}

.wave-bar {
  width: 4px;
  height: 10px;
  background-color: #c44558;
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

.rolling-spinner {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
  border: 2px solid rgba(255, 255, 255, 0.22);
  border-top: 2px solid #ffffff;
  border-radius: 50%;
  animation: roll 1s linear infinite;
}

@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(196, 69, 88, 0.35);
  }
  70% {
    box-shadow: 0 0 0 24px rgba(196, 69, 88, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(196, 69, 88, 0);
  }
}

@keyframes roll {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

@media (max-width: 767px) {
  .voice-hero-card,
  .voice-control-card {
    grid-template-columns: 1fr;
    display: grid;
  }

  .voice-hero-card {
    gap: 1rem;
  }

  .hero-copy h2 {
    font-size: 1.45rem;
  }

  .hero-status {
    min-width: auto;
  }

  .voice-stage {
    min-height: 190px;
  }
}
</style>
