// Clickable area of an object, in scene coordinates. Offsets are in the object's own units (scale 1).

const HITBOXES = {
  person: () => ({ left: -17, top: -69, width: 34, height: 71 }),
  reindeer: (object) => ({ left: object.flip ? -32 : -24, top: -61, width: 56, height: 62 }),
  snowman: () => ({ left: -20, top: -70, width: 40, height: 72 }),
  tree: () => ({ left: -30, top: -94, width: 60, height: 96 }),
  mitten: () => ({ left: -16, top: -26, width: 32, height: 30 }),
  gift: () => ({ left: -16, top: -35, width: 32, height: 36 }),
};

export function getHitbox(object) {
  const local = (HITBOXES[object.type] ?? HITBOXES.gift)(object);
  const { scale } = object;
  return {
    x: object.x + local.left * scale,
    y: object.y + local.top * scale,
    width: local.width * scale,
    height: local.height * scale,
  };
}

export const hitboxCenter = (box) => ({ x: box.x + box.width / 2, y: box.y + box.height / 2 });

export function containsPoint(box, x, y, padding = 0) {
  return x >= box.x - padding && x <= box.x + box.width + padding
    && y >= box.y - padding && y <= box.y + box.height + padding;
}
