import { shallowMount } from '@vue/test-utils';
import CorrelationSection from '@/modules/msdat-dashboard/components/sections/advanced/correlation-section/CorrelationSection.vue';

const BEmbedStub = {
  name: 'b-embed',
  props: ['src', 'width', 'height', 'type', 'aspect'],
  template: '<div class="embed-stub"></div>',
};

describe('CorrelationSection.vue', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  it('renders the loader when loading', () => {
    const wrapper = shallowMount(CorrelationSection, {
      stubs: { 'b-embed': BEmbedStub },
    });

    expect(wrapper.find('.loader').exists()).toBe(true);
  });

  it('binds the iframe src and sizing props', () => {
    const wrapper = shallowMount(CorrelationSection, {
      stubs: { 'b-embed': BEmbedStub },
    });

    const embed = wrapper.findComponent({ name: 'b-embed' });
    expect(embed.exists()).toBe(true);
    expect(embed.props('src')).toBe('https://correlation.e4eweb.space/viz');
    expect(embed.props('width')).toBe('100%');
    expect(embed.props('height')).toBe('400');
  });

  it('sets isLoading to false when iframe content is loaded', async () => {
    const mockDoc = { readyState: 'complete' };
    const mockCanvas = { contentDocument: mockDoc, contentWindow: { document: mockDoc } };
    jest.spyOn(document, 'querySelector').mockReturnValue(mockCanvas);

    const wrapper = shallowMount(CorrelationSection, {
      stubs: { 'b-embed': BEmbedStub },
    });

    wrapper.vm.isLoading = true;
    wrapper.vm.isLoaded();
    jest.advanceTimersByTime(1000);
    await wrapper.vm.$nextTick();

    expect(wrapper.vm.isLoading).toBe(false);
  });

  it('calls isLoaded on mount', () => {
    const isLoadedSpy = jest.spyOn(CorrelationSection.methods, 'isLoaded');
    shallowMount(CorrelationSection, {
      stubs: { 'b-embed': BEmbedStub },
    });

    expect(isLoadedSpy).toHaveBeenCalled();
  });
});
