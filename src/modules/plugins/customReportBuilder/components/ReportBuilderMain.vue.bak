<template>
  <div class="report-builder-modal">
    <div class="modal-backdrop" @click.self="close"></div>
    <div class="modal-panel">
      <div class="modal-header">
        <h3>Custom Report Builder</h3>
        <button class="close-btn" @click="close">x</button>
      </div>
      <div class="report-title-section">
        <label>Report Title: <input v-model="reportTitle" placeholder="Enter report title" style="width: 300px; padding: 5px;" /></label>
      </div>
      <div class="builder-container">
        <div class="toolbox">
          <h4>Toolbox</h4>
          <div class="tool-item" @click="addItem('chart')">Chart</div>
          <div class="tool-item" @click="addItem('table')">Table</div>
          <div class="tool-item" @click="addItem('text')">Text</div>
        </div>
        <div class="canvas">
          <div v-if="isCapturingChart || isCapturingTable" class="capture-overlay">
            <div class="spinner" />
            <div class="spinner-text">{{ isCapturingChart ? 'Capturing chart(s)...' : 'Capturing table...' }}</div>
          </div>
          <div v-if="!isPreviewMode" class="canvas-content-wrapper">
            <draggable v-model="reportItems" class="draggable-list" handle=".drag-handle">
              <transition-group>
                <div v-for="(item, index) in reportItems" :key="index" class="canvas-item">
                  <div class="drag-handle" title="Drag to reorder">☰</div>
                  <div class="item-badge">
                    <small v-if="item.data && item.data.image">Snapshot</small>
                    <small v-else-if="item.data && (item.data.series || item.data.options)">Live</small>
                    <small v-else>Empty</small>
                  </div>
                  <button class="item-close" @click="removeItem(index)" aria-label="Remove item">×</button>
                  <div class="item-title-section">
                    <input v-model="item.title" :placeholder="`${item.type.charAt(0).toUpperCase() + item.type.slice(1)} ${index + 1}`" class="item-title-input" />
                  </div>
                  <div class="canvas-content">
                    <div class="item-toolbar">
                      <div class="toolbox-inline">
                        <button class="tool-btn" title="Annotate" @click.stop="toggleAnnotate(index)">✎</button>
                        <button class="tool-btn" title="Add text" @click.stop="addAnnotationType(index, 'text')">T</button>
                        <button class="tool-btn" title="Add arrow" @click.stop="addAnnotationType(index, 'arrow')">➤</button>
                        <button class="tool-btn" title="Add box" @click.stop="addAnnotationType(index, 'box')">▭</button>
                        <input type="color" v-model="item.toolSettingsColor" @input.stop="setToolColor(index, $event.target.value)" title="Color" />
                        <input type="number" v-model.number="item.toolSettingsSize" min="8" max="48" @input.stop="setToolSize(index, item.toolSettingsSize)" title="Size" style="width:56px" />
                        <button class="tool-btn" title="Save Item" @click.stop="saveItem(index)">💾</button>
                      </div>
                    </div>
                    <div class="resizable-wrapper"
                      ref="resizable"
                      :data-index="index"
                      :style="{ width: item.data && item.data.width ? item.data.width : '100%', height: item.data && item.data.height ? item.data.height : 'auto', overflow: 'auto', maxWidth: '100%', maxHeight: '100%' }"
                      @click="onCanvasClick($event, index)">
                      <div class="overlay-container" style="position:relative; width:100%">
                        <component :is="componentName(item.type)" :data="item.data" />
                        <div v-if="item.data && item.data.annotations" class="annotation-overlay" @mousedown.stop>
                          <div v-for="(a, aidx) in item.data.annotations" :key="aidx"
                            class="annotation-thing"
                            :style="{ position: 'absolute', left: a.x + 'px', top: a.y + 'px', cursor: item.editMode === 'annotate' ? 'move' : 'pointer' }"
                            @mousedown.stop.prevent="startDragAnnotation($event, index, aidx)"
                            @click.stop.prevent="openAnnotationEditor(index, aidx)">
                            <span class="annotation-label" :style="{ color: a.color || '#000', fontSize: (a.size || 12) + 'px' }">{{ a.type === 'arrow' ? '➤' : (a.type === 'box' ? '▭' : '✎') }}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </transition-group>
            </draggable>
          </div>
          <div v-else class="preview-mode canvas-content-wrapper">
            <h3>{{ reportTitle }}</h3>
            <div v-for="(item, idx) in reportItems" :key="idx" class="preview-item">
              <h4>{{ item.title || `${item.type.charAt(0).toUpperCase() + item.type.slice(1)} ${idx + 1}` }}</h4>
              <div class="preview-content">
                <component :is="componentName(item.type)" :data="item.data" />
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="actions">
        <button @click="saveState">Save</button>
        <button v-if="!isPreviewMode" @click="previewReport">Preview</button>
        <button v-if="isPreviewMode" @click="editReport">Edit</button>
        <div class="export-dropdown" style="position: relative; display: inline-block;">
          <button @click="toggleExportMenu">Export ▲</button>
          <div v-if="showExportMenu" class="export-menu" style="position: absolute; bottom: 100%; left: 0; background: white; border: 1px solid #ccc; min-width: 120px; z-index: 1000; box-shadow: 0 -2px 8px rgba(0,0,0,0.1);">
            <button @click="exportAsPDF" class="export-option" style="display: block; width: 100%; text-align: left; padding: 8px; border: none; background: white; cursor: pointer; color: #333;">PDF</button>
            <button @click="exportAsDOCX" class="export-option" style="display: block; width: 100%; text-align: left; padding: 8px; border: none; background: white; cursor: pointer; color: #333;">DOCX</button>
          </div>
        </div>
      </div>
    </div>
    <!-- Inline Annotation Editor Modal -->
    <div v-if="annotationEditor.open" class="annotation-editor-modal">
      <div class="annotation-editor">
        <h4>Edit Annotation</h4>
        <label>Text: <input v-model="annotationEditor.text" /></label>
        <label>Color: <input type="color" v-model="annotationEditor.color" /></label>
        <label>Size: <input type="number" v-model.number="annotationEditor.size" min="8" max="48" /></label>
        <div class="editor-actions">
          <button @click="saveAnnotationEdit">Save</button>
          <button @click="closeAnnotationEditor">Cancel</button>
          <button @click="deleteAnnotation(annotationEditor.itemIndex, annotationEditor.annIndex)">Delete</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import ChartComponent from './ChartComponent.vue';
import TableComponent from './TableComponent.vue';
import TextComponent from './TextComponent.vue';
import draggable from 'vuedraggable';
import html2canvas from 'html2canvas';
import Highcharts from 'highcharts';

export default {
  name: 'ReportBuilderMain',
  components: {
    draggable,
    ChartComponent,
    TableComponent,
    TextComponent,
  },
  data() {
    return {
      reportItems: [],
  draggedType: null,
  isCapturingChart: false,
  isCapturingTable: false,
  annotationEditor: { open: false, itemIndex: null, annIndex: null, text: '' },
      isPreviewMode: false,
      reportTitle: 'Custom Report',
      showExportMenu: false,
    };
  },
  methods: {
    async addItem(type) {
      let itemsAdded = 0;
  if (type === 'table') {
        const waitForPayload = async (timeout = 1000, interval = 100) => {
          const start = Date.now();
          while (Date.now() - start < timeout) {
            try {
              const sel = (this.$store && this.$store.getters && typeof this.$store.getters.getSelectedConfig !== 'undefined') ? this.$store.getters.getSelectedConfig : null;
              if (sel && Object.keys(sel).length > 0) return sel;
              const controlConfig = (this.$store && this.$store.state && this.$store.state.MSDAT_STORE && this.$store.state.MSDAT_STORE.controlConfig) || null;
              if (controlConfig && controlConfig.length && controlConfig[0].payload) return controlConfig[0].payload;
            } catch (e) {
              // ignore and retry
            }
            // eslint-disable-next-line no-await-in-loop
            await new Promise((r) => setTimeout(r, interval));
          }
          return null;
        };

        let currentPayload = null;
        try {
          if (this.$store && this.$store.getters && typeof this.$store.getters.getSelectedConfig !== 'undefined') {
            currentPayload = this.$store.getters.getSelectedConfig || null;
          }
        } catch (e) {
          currentPayload = null;
        }

        if (!currentPayload) currentPayload = await waitForPayload();

        const normalize = (v) => {
          if (v === null || v === undefined) return v;
          if (typeof v === 'number' || typeof v === 'string') return v;
          if (typeof v === 'object') {
            if (v.id) return v.id;
            if (v.item) return v.item;
            if (v.datasource) return (typeof v.datasource === 'object' ? (v.datasource.id || v.datasource) : v.datasource);
            if (v.dataSource) return (typeof v.dataSource === 'object' ? (v.dataSource.id || v.dataSource) : v.dataSource);
            return v;
          }
          return v;
        };

        const tableQuery = currentPayload ? {
          indicator: normalize(currentPayload.indicator),
          datasource: normalize(currentPayload.datasource || currentPayload.dataSource),
          location: currentPayload.location || null,
          year: normalize(currentPayload.year || currentPayload.period),
        } : null;

        // Log the generated tableQuery for in-app debugging
        // eslint-disable-next-line no-console
        console.info('ReportBuilderMain: adding table with query=', tableQuery);

            if (this.addItemWithContext) {
          // show spinner while snapshot runs
          this.isCapturingTable = true;
          try {
            // always attempt to add via addItemWithContext so snapshot fallback runs
            const idx = await this.addItemWithContext('table', { query: tableQuery || {}, forceSnapshot: true });
            if (typeof idx === 'number') itemsAdded += 1;
            return;
          } finally {
            this.isCapturingTable = false;
          }
        }
      }

      if (type === 'chart') {
        // Try to capture any existing charts on the dashboard. Prefer Highcharts instances,
        // otherwise capture all matching chart DOM elements. Add one report item per chart found.
        if (this.addItemWithContext) {
          this.isCapturingChart = true;
          try {
            let foundAny = false;

            // prefer global Highcharts instances if available
            if (typeof window !== 'undefined' && window.Highcharts && Array.isArray(window.Highcharts.charts)) {
              const charts = window.Highcharts.charts.filter((ch) => ch && (ch.series && ch.series.length > 0 || ch.renderTo));
              if (charts.length > 0) {
                foundAny = true;
                // iterate all charts and attempt to produce PNG snapshots from their SVG
                for (let i = 0; i < charts.length; i += 1) {
                  const c = charts[i];
                  try {
                    // try getSVG() if available
                    let svg = null;
                    if (typeof c.getSVG === 'function') {
                      try { svg = c.getSVG(); } catch (e) { svg = null; }
                    }
                    // fallback: try to read embedded svg from renderTo
                    if (!svg && c.renderTo) {
                      const svgEl = c.renderTo.querySelector && c.renderTo.querySelector('svg');
                      if (svgEl) svg = svgEl.outerHTML;
                    }

                    if (svg) {
                      // convert svg -> png data URL
                      const chartImage = await (async (svgString) => {
                        try {
                          // prefer createImageBitmap for blobs when available
                          const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
                          if (typeof createImageBitmap === 'function') {
                            const bitmap = await createImageBitmap(blob);
                            const canvas = document.createElement('canvas');
                            canvas.width = bitmap.width || (c.chartWidth || 800);
                            canvas.height = bitmap.height || (c.chartHeight || 400);
                            const ctx = canvas.getContext('2d');
                            ctx.drawImage(bitmap, 0, 0);
                            return canvas.toDataURL('image/png');
                          }
                          // fallback: use Image with data URL
                          return await new Promise((res, rej) => {
                            const img = new Image();
                            img.onload = () => {
                              try {
                                const canvas = document.createElement('canvas');
                                canvas.width = img.width || (c.chartWidth || 800);
                                canvas.height = img.height || (c.chartHeight || 400);
                                const ctx = canvas.getContext('2d');
                                ctx.drawImage(img, 0, 0);
                                res(canvas.toDataURL('image/png'));
                              } catch (ex) { rej(ex); }
                            };
                            img.onerror = rej;
                            img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgString);
                          });
                        } catch (ex) {
                          return null;
                        }
                      })(svg);

                      if (chartImage) {
                          // add a chart item using the snapshot image
                          // eslint-disable-next-line no-await-in-loop
                          const idx = await this.addItemWithContext('chart', { chartImage });
                          if (typeof idx === 'number') itemsAdded += 1;
                          continue;
                        }
                    }

                    // if we couldn't produce an image, fall back to providing config so ChartComponent can render
                    const chartConfig = { options: c.options || {}, series: (c.series || []).map((s) => s.options || s) };
                    // eslint-disable-next-line no-await-in-loop
                    {
                      const idx = await this.addItemWithContext('chart', { chartConfig });
                      if (typeof idx === 'number') itemsAdded += 1;
                    }
                  } catch (inner) {
                    // don't fail the whole loop for one bad chart
                    // eslint-disable-next-line no-console
                    console.warn('failed to capture one highcharts instance', inner);
                  }
                }
                // if we added items above, return early
                if (foundAny) return;
              }
            }

            // fallback: try to find all chart elements in DOM
            const selList = '[data-highcharts-chart], #main-chart, .highcharts-root, .chart, [data-chart]';
            const els = Array.from(document.querySelectorAll(selList));
            if (els && els.length) {
              foundAny = true;
              for (let i = 0; i < els.length; i += 1) {
                const el = els[i];
                try {
                  // eslint-disable-next-line no-await-in-loop
                  const idx = await this.addItemWithContext('chart', { chartSelector: el });
                  if (typeof idx === 'number') itemsAdded += 1;
                } catch (e) {
                  // continue on error
                }
              }
              if (foundAny) return;
            }
          } catch (e) {
            // eslint-disable-next-line no-console
            console.warn('chart capture attempt failed', e);
          } finally {
            this.isCapturingChart = false;
          }
        }
      }

      if (itemsAdded === 0) {
        this.reportItems.push({ type, data: this.defaultDataFor(type), title: '' });
      }
    },

    async addItemWithContext(type, context = {}) {
      const base = this.defaultDataFor(type);
      if (type === 'chart') {
        // accept pre-rendered chart image (from svg->png conversion)
        if (context.chartImage) {
          // If caller supplied a pre-rendered image, use it and finish immediately.
          base.image = context.chartImage;
          this.reportItems.push({ type, data: base });
          return this.reportItems.length - 1;
        }
        if (context.chartConfig) {
          base.series = context.chartConfig.series || base.series;
          base.options = context.chartConfig.options || base.options;
          // Attempt to render an off-screen chart from the provided config so we always
          // produce a PNG snapshot image instead of relying on live-chart rendering.
          try {
            const container = document.createElement('div');
            container.style.position = 'absolute';
            container.style.left = '-9999px';
            container.style.top = '0';
            container.style.width = (context.chartConfig.options && context.chartConfig.options.chart && context.chartConfig.options.chart.width) ? `${context.chartConfig.options.chart.width}px` : '800px';
            container.style.height = (context.chartConfig.options && context.chartConfig.options.chart && context.chartConfig.options.chart.height) ? `${context.chartConfig.options.chart.height}px` : '400px';
            document.body.appendChild(container);
            // clone options to avoid mutating original
            const opts = JSON.parse(JSON.stringify(context.chartConfig.options || {}));
            opts.series = context.chartConfig.series || opts.series || [];
            // ensure chart renders to our container
            opts.chart = opts.chart || {};
            opts.chart.renderTo = container;
            // try synchronous render
            let chartInstance = null;
            try { chartInstance = Highcharts.chart(container, opts); } catch (e) { chartInstance = null; }
            // allow a tick for fonts/styles to apply
            // eslint-disable-next-line no-await-in-loop
            await new Promise((r) => setTimeout(r, 80));
            try {
              // prefer chart.getSVG -> convert to image
              let svg = null;
              if (chartInstance && typeof chartInstance.getSVG === 'function') {
                try { svg = chartInstance.getSVG(); } catch (e) { svg = null; }
              }
              if (!svg) {
                const svgEl = container.querySelector && container.querySelector('svg');
                if (svgEl) svg = svgEl.outerHTML;
              }
              if (svg) {
                try {
                  const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
                  if (typeof createImageBitmap === 'function') {
                    const bitmap = await createImageBitmap(blob);
                    const canvas = document.createElement('canvas');
                    canvas.width = bitmap.width || (opts.chart && opts.chart.width) || 800;
                    canvas.height = bitmap.height || (opts.chart && opts.chart.height) || 400;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(bitmap, 0, 0);
                    base.image = canvas.toDataURL('image/png');
                  } else {
                    // fallback to Image
                    // eslint-disable-next-line no-await-in-loop
                    base.image = await new Promise((res, rej) => {
                      const img = new Image();
                      img.onload = () => {
                        try {
                          const canvas = document.createElement('canvas');
                          canvas.width = img.width || (opts.chart && opts.chart.width) || 800;
                          canvas.height = img.height || (opts.chart && opts.chart.height) || 400;
                          const ctx = canvas.getContext('2d');
                          ctx.drawImage(img, 0, 0);
                          res(canvas.toDataURL('image/png'));
                        } catch (ex) { rej(ex); }
                      };
                      img.onerror = rej;
                      img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
                    });
                  }
                } catch (ex) {
                  // ignore image conversion errors; we'll fallback to chartConfig as data
                }
              }
            } catch (ex) {
              // ignore
            }
            // destroy chart instance and cleanup
            try { if (chartInstance && typeof chartInstance.destroy === 'function') chartInstance.destroy(); } catch (e) { /* ignore */ }
            try { document.body.removeChild(container); } catch (e) { /* ignore */ }
          } catch (ex) {
            // eslint-disable-next-line no-console
            console.warn('Offscreen chart render failed', ex);
          }
        }
        if (context.chartSelector) {
          try {
            let el = null;
            if (typeof context.chartSelector === 'string') el = document.querySelector(context.chartSelector);
            else if (context.chartSelector instanceof Element) el = context.chartSelector;
            if (el) {
              try { el.scrollIntoView({ block: 'center', inline: 'nearest' }); } catch (e) { /* ignore */ }
              const canvas = await html2canvas(el, { useCORS: true, logging: false });
              base.image = canvas.toDataURL('image/png');
            }
          } catch (e) {
            // eslint-disable-next-line no-console
            console.warn('Chart snapshot failed', e);
          }
        }
      }
      if (type === 'table') {
        if (context.query) base.query = context.query;

  // Attempt to snapshot the visible dashboard table.
  // Instead of hiding the plugin (which causes the modal/icon to disappear),
  // we will clone the found element and capture the clone off-screen. This
  // preserves the user's UI while allowing a clean snapshot of the table.

  try {
          const selectors = ['#indicatorTable', '#the-table', '.table-component table', '#indicatorTable table'];
          // poll for the element to appear (in case of async rendering)
          let el = null;
          const start = Date.now();
          const timeout = 800; // ms
          const pollInterval = 100; // ms
          while (Date.now() - start < timeout) {
            for (let i = 0; i < selectors.length; i += 1) {
              const s = selectors[i];
              const found = document.querySelector(s);
              if (found) { el = found; break; }
            }
            if (el) break;
            // wait before retry
            // eslint-disable-next-line no-await-in-loop
            await new Promise((r) => setTimeout(r, pollInterval));
          }

          if (el) {
            try { el.scrollIntoView({ block: 'center', inline: 'nearest' }); } catch (e) {}
            try {
              // Try cloning the element and capturing the clone off-screen so the plugin
              // overlay doesn't need to be hidden.
              const cloneContainer = document.createElement('div');
              cloneContainer.style.position = 'absolute';
              cloneContainer.style.left = '-9999px';
              cloneContainer.style.top = '0';
              cloneContainer.style.visibility = 'visible';
              // deep clone the node
              const cloned = el.cloneNode(true);
              cloneContainer.appendChild(cloned);
              document.body.appendChild(cloneContainer);
              // give the browser a tick to apply styles
              // eslint-disable-next-line no-await-in-loop
              await new Promise((r) => setTimeout(r, 50));
              const canvas = await html2canvas(cloned, { useCORS: true, logging: false });
              base.image = canvas.toDataURL('image/png');
              base.debugQuery = context.query || null;
              base.fallbackSnapshot = true;
              // cleanup
              try { document.body.removeChild(cloneContainer); } catch (e) { /* ignore */ }
            } catch (eClone) {
              // fallback: capture the live element (may include plugin overlay if covering)
              try {
                const canvas = await html2canvas(el, { useCORS: true, logging: false });
                base.image = canvas.toDataURL('image/png');
                base.debugQuery = context.query || null;
                base.fallbackSnapshot = true;
              } catch (e2) {
                // eslint-disable-next-line no-console
                console.warn('Table snapshot fallback failed', e2);
              }
            }
          }
        } catch (e) {
          // eslint-disable-next-line no-console
          console.warn('Table snapshot fallback failed', e);
        } finally {
          // ensure we clear table spinner if caller left it set
          try { this.isCapturingTable = false; } catch (ex) { /* ignore */ }
        }
      }
      this.reportItems.push({ type, data: base, title: '' });
      return this.reportItems.length - 1;
    },

    removeItem(index) {
      this.reportItems.splice(index, 1);
    },
    toggleAnnotate(index) {
      const it = this.reportItems[index];
      if (!it) return;
      it.editMode = it.editMode === 'annotate' ? null : 'annotate';
      if (!it.data.annotations) this.$set(it.data, 'annotations', []);
      // initialize tool settings container
      if (!it.toolSettingsColor) this.$set(it, 'toolSettingsColor', '#ff0');
      if (!it.toolSettingsSize) this.$set(it, 'toolSettingsSize', 12);
    },
    addAnnotationType(index, type) {
      const it = this.reportItems[index];
      if (!it) return;
      if (!it.data.annotations) this.$set(it.data, 'annotations', []);
      // place new annotation center-ish
      const rectEl = this.$el.querySelector('.resizable-wrapper[data-index="' + index + '"]');
      const rect = rectEl ? rectEl.getBoundingClientRect() : { width: 200, height: 100 };
      const x = Math.round((rect.width || 200) / 2);
      const y = Math.round((rect.height || 100) / 2);
      it.data.annotations.push({ type, x, y, text: type === 'text' ? 'Text' : '', color: it.toolSettingsColor || '#000', size: it.toolSettingsSize || 12, id: Date.now() });
      it.editMode = 'annotate';
    },
    setToolColor(index, color) {
      const it = this.reportItems[index];
      if (!it) return; this.$set(it, 'toolSettingsColor', color);
    },
    setToolSize(index, size) {
      const it = this.reportItems[index];
      if (!it) return; this.$set(it, 'toolSettingsSize', size);
    },
    openAnnotationEditor(itemIndex, annIndex) {
      const it = this.reportItems[itemIndex];
      if (!it || !it.data.annotations || !it.data.annotations[annIndex]) return;
      const ann = it.data.annotations[annIndex];
      this.annotationEditor = { open: true, itemIndex, annIndex, text: ann.text || '', color: ann.color || '#000', size: ann.size || 12 };
    },
    closeAnnotationEditor() { this.annotationEditor.open = false; },
    saveAnnotationEdit() {
      const ae = this.annotationEditor;
      if (!ae.open) return;
      const it = this.reportItems[ae.itemIndex];
      if (!it || !it.data.annotations || !it.data.annotations[ae.annIndex]) return;
      const ann = it.data.annotations[ae.annIndex];
      this.$set(ann, 'text', ae.text);
      this.$set(ann, 'color', ae.color);
      this.$set(ann, 'size', ae.size);
      this.annotationEditor.open = false;
    },
    onCanvasClick(e, index) {
      const it = this.reportItems[index];
      if (!it) return;
      // when in annotate mode and click not on an annotation, add text annotation
      if (it.editMode === 'annotate') {
        const el = e.currentTarget;
        const rect = el.getBoundingClientRect();
        const x = Math.round(e.clientX - rect.left);
        const y = Math.round(e.clientY - rect.top);
        if (!it.data.annotations) this.$set(it.data, 'annotations', []);
        it.data.annotations.push({ type: 'text', x, y, text: 'Note', id: Date.now() });
      }
    },
  // resize persistence removed: items are fixed-size to avoid overflow
    startDragAnnotation(e, itemIndex, annIndex) {
      // init drag state
      this._dragging = { itemIndex, annIndex, startX: e.clientX, startY: e.clientY };
      window.addEventListener('mousemove', this.onDragMove);
      window.addEventListener('mouseup', this.stopDragAnnotation);
    },
    onDragMove(e) {
      if (!this._dragging) return;
      const { itemIndex, annIndex, startX, startY } = this._dragging;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      const it = this.reportItems[itemIndex];
      if (!it) return;
      const ann = it.data.annotations[annIndex];
      if (!ann) return;
      ann.x = Math.max(0, ann.x + dx);
      ann.y = Math.max(0, ann.y + dy);
      this._dragging.startX = e.clientX;
      this._dragging.startY = e.clientY;
    },
    stopDragAnnotation() {
      if (!this._dragging) return;
      window.removeEventListener('mousemove', this.onDragMove);
      window.removeEventListener('mouseup', this.stopDragAnnotation);
      this._dragging = null;
    },
    editAnnotation(itemIndex, annIndex, newText) {
      const it = this.reportItems[itemIndex];
      if (!it || !it.data.annotations || !it.data.annotations[annIndex]) return;
      this.$set(it.data.annotations[annIndex], 'text', newText);
    },
    deleteAnnotation(itemIndex, annIndex) {
      const it = this.reportItems[itemIndex];
      if (!it || !it.data.annotations) return;
      it.data.annotations.splice(annIndex, 1);
    },
    saveItem(index) {
      const item = this.reportItems[index];
      if (!item) return;
      // For text items, exit edit mode
      if (item.type === 'text' && item.data) {
        this.$set(item.data, 'isEditing', false);
      }
      try {
        const itemState = JSON.stringify(item);
        localStorage.setItem(`customReportBuilderItem_${index}`, itemState);
        // eslint-disable-next-line no-console
        console.info(`ReportBuilder: item ${index} saved`);
      } catch (e) {
        // eslint-disable-next-line no-console
        console.warn(`Failed to save item ${index}`, e);
      }
    },
    // keyboard shortcuts
    _keyDownHandler(e) {
      // Ctrl+Shift+A toggles annotate on first selected item (simple mapping)
      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'a') {
        if (this.reportItems.length) this.toggleAnnotate(0);
      }
      // Delete removes annotations when in annotate mode
      if (e.key === 'Delete' || e.key === 'Backspace') {
        const it = this.reportItems.find((ri) => ri.editMode === 'annotate');
        if (it && it.data && it.data.annotations && it.data.annotations.length) {
          // delete last annotation as a convenience
          it.data.annotations.pop();
        }
      }
    },
    // export composition: draw image + annotations onto canvas and return dataURL
    async composeItemCanvas(item) {
      if (!item || !item.data) return null;
  // determine canvas size: prefer explicit width/height, else use image natural size
  let width = null;
  let height = null;
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
      // draw image
      if (item.data.image) {
        await new Promise((res) => {
          const img = new Image();
          img.crossOrigin = 'anonymous';
          img.onload = () => {
            // set canvas size from image if no explicit size provided
            if (!item.data.width) width = img.naturalWidth || img.width;
            else width = parseInt(item.data.width, 10) || img.naturalWidth || img.width;
            if (!item.data.height) height = img.naturalHeight || img.height;
            else height = parseInt(item.data.height, 10) || img.naturalHeight || img.height;
            // clamp to reasonable maximums to avoid extremely large canvases
            const max = 3000;
            width = Math.min(width, max);
            height = Math.min(height, max);
            canvas.width = width;
            canvas.height = height;
            try { ctx.drawImage(img, 0, 0, width, height); } catch (e) { /* ignore draw errors */ }
            res();
          };
          img.onerror = () => { res(); };
          img.src = item.data.image;
        });
      }
      // draw annotations
      if (item.data.annotations && item.data.annotations.length) {
        ctx.fillStyle = 'rgba(255,255,0,0.9)';
        ctx.strokeStyle = 'rgba(0,0,0,0.8)';
        ctx.lineWidth = 1.5;
        item.data.annotations.forEach((a) => {
          if (a.type === 'text') {
            ctx.fillStyle = 'rgba(255,255,0,0.9)';
            ctx.fillRect(a.x - 4, a.y - 12, ctx.measureText(a.text || 'Note').width + 8, 18);
            ctx.fillStyle = '#000';
            ctx.fillText(a.text || 'Note', a.x, a.y);
          } else if (a.type === 'arrow') {
            // simple arrow rendering
            ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo((a.x + 40), a.y); ctx.stroke();
            ctx.fillText(a.text || '', a.x + 44, a.y + 4);
          } else if (a.type === 'box') {
            ctx.strokeRect(a.x, a.y, a.w || 60, a.h || 30);
            if (a.text) { ctx.fillText(a.text, a.x + 4, a.y + 14); }
          }
        });
      }
      return canvas.toDataURL('image/png');
    },
    toggleAnnotate(index) {
      const it = this.reportItems[index];
      if (!it) return;
      it.editMode = it.editMode === 'annotate' ? null : 'annotate';
      // ensure annotations array exists
      if (!it.data.annotations) this.$set(it.data, 'annotations', []);
    },
    onCanvasClick(e, index) {
      const it = this.reportItems[index];
      if (!it || it.editMode !== 'annotate') return;
      // add a simple text annotation at click position
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      it.data.annotations.push({ type: 'text', x, y, text: 'New note' });
    },
    previewReport() { 
      // eslint-disable-next-line no-console
      console.info('Preview Report:', this.reportItems);
      this.isPreviewMode = true;
    },
    editReport() {
      this.isPreviewMode = false;
    },
    toggleExportMenu() {
      this.showExportMenu = !this.showExportMenu;
    },
    exportAsPDF() {
      this.showExportMenu = false;
      this.exportReport('pdf');
    },
    exportAsDOCX() {
      this.showExportMenu = false;
      this.exportReport('docx');
    },
    async exportReport(format = 'pdf') {
      // eslint-disable-next-line no-console
      console.info('Exporting Report...');
      // compose each item into a snapshot that includes annotations, then emit
      const composed = [];
      for (let i = 0; i < this.reportItems.length; i += 1) {
        const item = this.reportItems[i];
        if (item.type === 'text') {
          // For text items, pass the data directly instead of creating an image
          composed.push({ 
            type: item.type, 
            data: item.data,
            image: null,
            title: item.title || `${item.type.charAt(0).toUpperCase() + item.type.slice(1)} ${i + 1}`
          });
        } else {
          // For chart/table items, compose into image
          // eslint-disable-next-line no-await-in-loop
          const dataUrl = await this.composeItemCanvas(item);
          composed.push({ 
            type: item.type, 
            image: dataUrl,
            data: item.data,
            title: item.title || `${item.type.charAt(0).toUpperCase() + item.type.slice(1)} ${i + 1}`
          });
        }
      }
      // eslint-disable-next-line no-console
      console.info('Composed items for export:', composed);
      this.$emit('export', { items: composed, title: this.reportTitle, format });
    },
    close() { this.$emit('setActiveComponent', 'launcher'); },
    saveState() {
      try {
        const state = JSON.stringify(this.reportItems);
        localStorage.setItem('customReportBuilderState', state);
        // eslint-disable-next-line no-console
        console.info('ReportBuilder: state saved');
      } catch (e) {
        // eslint-disable-next-line no-console
        console.warn('Failed to save state', e);
      }
    },
    loadState() {
      try {
        const state = localStorage.getItem('customReportBuilderState');
        if (state) {
          this.reportItems = JSON.parse(state);
          // eslint-disable-next-line no-console
          console.info('ReportBuilder: state loaded');
        }
      } catch (e) {
        // eslint-disable-next-line no-console
        console.warn('Failed to load state', e);
      }
    },
    componentName(type) {
      if (type === 'chart') return 'ChartComponent';
      if (type === 'table') return 'TableComponent';
      return 'TextComponent';
    },
    defaultDataFor(type) {
  if (type === 'chart') return { series: [], options: {}, annotations: [] };
  if (type === 'table') return { rows: [], columns: [], annotations: [] };
      return { text: '', styles: { fontSize: 14, bold: false, color: '#000000' }, isEditing: false };
    },
  },
  mounted() {
    window.addEventListener('keydown', this._keyDownHandler);
    this.loadState();
  },
  beforeDestroy() {
    window.removeEventListener('keydown', this._keyDownHandler);
  },
};
</script>

<style scoped>
.report-builder-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 10000;
}
.modal-backdrop {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
}
.modal-panel {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 80%;
.max-width-override { max-width: 1200px; }
  background: white;
  border-radius: 8px;
  padding: 20px;
  z-index: 10001; /* ensure panel is above backdrop */
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.modal-body { overflow: auto; }
.modal-backdrop { z-index: 10000; }
.capture-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255,255,255,0.85);
  z-index: 10002;
  flex-direction: column;
}
.spinner {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  border: 4px solid #ccc;
  border-top-color: #007bff;
  animation: spin 1s linear infinite;
}
.spinner-text { margin-top: 8px; font-size: 12px; color: #333; }
@keyframes spin { to { transform: rotate(360deg); } }
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.builder-container {
  display: flex;
  flex: 1;
  overflow: hidden;
  min-height: 0;
}
.toolbox {
  width: 200px;
  border: 1px solid #ccc;
  padding: 10px;
}
.tool-item {
  padding: 10px;
  margin: 5px;
  background: #f0f0f0;
  cursor: pointer;
}
.canvas {
  flex: 1;
  border: 1px solid #ccc;
  padding: 10px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  min-height: 0;
}
.canvas-content-wrapper {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding-bottom: 20px;
}
.draggable-list{
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 15px;
}
.canvas-item {
  margin: 10px;
  padding: 10px;
  border: 1px solid #ddd;
  background: #fff;
  position: relative;
}
.canvas-content { padding-top: 8px; }
.item-badge { position: absolute; top: -10px; left: 10px; background: #333; color: #fff; padding: 2px 6px; border-radius: 10px; font-size: 11px; }
.drag-handle { position: absolute; left: 2px; top: 2px; cursor: grab; color: #666; z-index: 10; }
.item-actions {
  margin-top: 8px;
}
.item-close { position: absolute; right: 8px; top: 6px; background: red; color: white; border: none; border-radius:30%; font-size: 18px; cursor: pointer; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; }
.item-toolbar { margin-bottom: 6px; margin-top: 10px; display: none; }
.canvas-item:hover .item-toolbar { display: block; }
.resizable-wrapper { border: 1px dashed #ccc; padding: 6px; background: #fff; }
.toolbox-inline { display:flex; gap:6px; align-items:center; justify-content: center; }
.tool-btn { background:#fff;border:1px solid #ddd;padding:4px 6px;border-radius:4px;cursor:pointer }
.overlay-container > img, .overlay-container img { display:block; max-width:100%; height:auto; object-fit:contain }
.annotation-overlay { position:absolute; left:0; top:0; right:0; bottom:0; pointer-events:none }
.canvas-item.editing .annotation-overlay { pointer-events:auto }
.annotation-thing { pointer-events:auto; }
.annotation-label { background:rgba(255,255,0,0.9); padding:2px 4px; border-radius:3px; }
.annotation-editor-modal { position:fixed; inset:0; display:flex; align-items:center; justify-content:center; z-index:10010 }
.annotation-editor { background:#fff; padding:12px; border-radius:6px; box-shadow:0 2px 10px rgba(0,0,0,0.2) }
.drag-handle { position: absolute; left: 4px; top: 4px; cursor: grab; color: #666; padding:6px; border-radius:4px; background: #e0e0e0; border: 1px solid #999; margin-top:5px; }
.drag-handle:active { cursor:grabbing }
.report-title-section { padding: 10px 0; border-bottom: 1px solid #eee; margin-bottom: 10px; }
.item-title-section { margin-bottom: 8px; }
.item-title-input { width: 40%; padding: 4px 8px; border: 1px solid #ddd; border-radius: 3px; font-size: 12px; margin-left: 25px; margin-top:5px;}
.export-menu button:hover { background-color: #f0f0f0; }
.export-option:hover { background-color: #4CAF50 !important; color: white !important; }
.preview-mode { padding: 20px; }
.preview-item { margin-bottom: 30px; border: 1px solid #ddd; padding: 15px; border-radius: 5px; }
.preview-content { margin-top: 10px; }
.actions {
  margin-top: 20px;
  display: flex;
  gap: 8px;
}
.close-btn {
  background: red;
  color: white;
  border: none;
  border-radius: 20%;
  font-size: 16px;
  cursor: pointer;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
