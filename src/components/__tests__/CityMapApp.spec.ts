import { describe, it, expect } from 'vitest'

import { mount } from '@vue/test-utils'
import CityMapApp from '@/components/CityMapApp.vue'

describe('CityMapApp', () => {
  it('renders properly', () => {
    const wrapper = mount(CityMapApp, {})
    expect(wrapper.html()).toContain('canvas')
  })
})
