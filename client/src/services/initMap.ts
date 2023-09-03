import { ref } from 'vue'
import * as THREE from 'three'
import { MAP_OPTIONS, PRECISION } from '@/constants/maps'
import { ThreeJSOverlayView } from '@googlemaps/three'
import { Loader } from '@googlemaps/js-api-loader'
import type { Intersection } from 'three'

export async function initMap(mapElement: HTMLElement) {
  const loader = new Loader({
    apiKey: import.meta.env.VITE_MAP_API_KEY,
    version: 'weekly',
    libraries: ['places', 'drawing']
  })

  const { Map: GoogleMap } = await loader.importLibrary('maps')
  const selectedObjects = ref<Array<THREE.Object3D>>([])
  //map = new Map(mapElement, MAP_OPTIONS);
  const map = new GoogleMap(mapElement, MAP_OPTIONS)

  const overlay = new ThreeJSOverlayView({
    map,
    //upAxis: "Y",
    anchor: MAP_OPTIONS.center
  })

  overlay.setUpAxis(new THREE.Vector3(0, 1, 0))
  overlay.setMap(map)
  overlay.onRemove = () => {
    google.maps.event.trigger(map, 'idle')
  }

  const mapDiv = map.getDiv()

  map.addListener('click', (ev: google.maps.MapMouseEvent) => {
    const domEvent = ev.domEvent as MouseEvent
    const latLng = ev.latLng as google.maps.LatLng
    const { left, top, width, height } = mapDiv.getBoundingClientRect()
    const x = domEvent.clientX - left
    const y = domEvent.clientY - top
    const mousePosition = new THREE.Vector2(2 * (x / width) - 1, 1 - 2 * (y / height))
    //console.log(mousePosition.sub(new THREE.Vector2(box.position.x, box.position.z)).length())
    //console.log(latLng.lat(), latLng.lng(), overlay.scene.children)

    selectedObjects.value = overlay
      .raycast(mousePosition)
      .map((intersection: Intersection) => intersection.object)

    if (selectedObjects.value.length) {
      if (
        Math.abs((map.getCenter()?.lat() ?? 0) - latLng.lat()) > PRECISION &&
        Math.abs((map.getCenter()?.lng() ?? 0) - latLng.lng()) > PRECISION
      ) {
        map.setZoom((map.getZoom() ?? MAP_OPTIONS.zoom) * 1.1)
        map.panTo(latLng)
      }
    }

    overlay.requestRedraw()
  })

  const drawingManager = new google.maps.drawing.DrawingManager({
    drawingControl: false,
    drawingControlOptions: {
      //position: google.maps.ControlPosition.TOP_RIGHT
      drawingModes: [google.maps.drawing.OverlayType.POLYGON]
    },
    markerOptions: {
      icon: 'https://developers.google.com/maps/documentation/javascript/examples/full/images/beachflag.png'
    },
    polygonOptions: {
      editable: true,
      draggable: false,
      strokeWeight: 1,
      strokeOpacity: 0.2,
      fillColor: 'white'
    }
  })
  drawingManager.setMap(map)

  const resetZoom = () => {
    map.setZoom(MAP_OPTIONS.zoom)
  }

  return {
    map,
    context: overlay,
    drawer: drawingManager,
    selectedObjects,
    resetZoom
  }
}
