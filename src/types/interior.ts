import { Vector2 } from 'three'

type WallWindow = {
  width: number
  height: number
  base: number
  left: number
}
export type Wall = {
  start: Vector2
  end: Vector2
  windows: Array<WallWindow>
}
export type Building = {
  floors: Array<{
    number: number
    height: number
    border: Array<Vector2>
    walls: Array<Wall>
  }>
}
export type WallSerialized = {
  start: number[]
  end: number[]
  windows: Array<WallWindow>
}
export type BuildingSerialized = {
  floors: Array<{
    number: number
    height: number
    border: number[][]
    walls: Array<WallSerialized>
  }>
  id: number
}
