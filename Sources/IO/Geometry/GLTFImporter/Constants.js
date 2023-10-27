export const AccessorComponentTypes = {
  BYTE: 5120,
  UNSIGNED_BYTE: 5121,
  SHORT: 5122,
  UNSIGNED_SHORT: 5123,
  UNSIGNED_INT: 5125,
  FLOAT: 5126,
};

export const AccessorTypes = {
  SCALAR: 'SCALAR',
  VEC2: 'VEC2',
  VEC3: 'VEC3',
  VEC4: 'VEC4',
  MAT2: 'MAT2',
  MAT3: 'MAT3',
  MAT4: 'MAT4',
};

export const BufferViewTargets = {
  ARRAY_BUFFER: 34962,
  ELEMENT_ARRAY_BUFFER: 34963,
};

export const MeshPrimitiveModes = {
  POINTS: 0,
  LINES: 1,
  LINE_LOOP: 2,
  LINE_STRIP: 3,
  TRIANGLES: 4,
  TRIANGLE_STRIP: 5,
  TRIANGLE_FAN: 6,
};

export default {
  AccessorComponentTypes,
  AccessorTypes,
  BufferViewTargets,
  MeshPrimitiveModes,
};
