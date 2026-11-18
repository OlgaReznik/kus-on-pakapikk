// Zooming, panning and click-to-scene-coordinate conversion for the picture.

import { SCENE, ZOOM } from '../config.js';

const DRAG_THRESHOLD_PX = 6;
/** On phones and tablets the picture fills the screen height and is scrolled sideways. */
const TOUCH_LAYOUT_QUERY = window.matchMedia('(max-width: 700px), (pointer: coarse)');

const touchDistance = (a, b) => Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);

export class Viewport {
  /**
   * @param {HTMLElement} container scrollable area
   * @param {HTMLElement} stage element holding the canvases
   * @param {(x: number, y: number, info: {isTouch: boolean}) => void} onSceneClick called with scene coordinates
   */
  constructor(container, stage, onSceneClick) {
    this.container = container;
    this.stage = stage;
    this.onSceneClick = onSceneClick;
    this.zoom = ZOOM.min;
    this.drag = null;
    this.pinch = null;
    this.suppressNextClick = false;
    this.bindEvents();
  }

  zoomIn() { this.setZoom(this.zoom * ZOOM.buttonStep); }

  zoomOut() { this.setZoom(this.zoom / ZOOM.buttonStep); }

  /** Back to the starting zoom, with the middle of the picture in view. */
  reset() {
    this.setZoom(ZOOM.min);
    this.container.scrollLeft = (this.container.scrollWidth - this.container.clientWidth) / 2;
    this.container.scrollTop = 0;
  }

  refit() { this.setZoom(this.zoom); }

  /** Zooms while keeping the scene point under (anchorX, anchorY) in place. */
  setZoom(zoom, anchorX = this.container.clientWidth / 2, anchorY = this.container.clientHeight / 2) {
    const { container, stage } = this;
    const oldWidth = stage.offsetWidth || this.fitWidth();
    const oldHeight = (oldWidth * SCENE.height) / SCENE.width;
    const focusX = (container.scrollLeft + anchorX - stage.offsetLeft) / oldWidth;
    const focusY = (container.scrollTop + anchorY - stage.offsetTop) / oldHeight;

    this.zoom = Math.min(ZOOM.max, Math.max(ZOOM.min, zoom));
    const width = this.fitWidth() * this.zoom;
    const height = (width * SCENE.height) / SCENE.width;
    stage.style.width = `${width}px`;
    stage.style.height = `${height}px`;
    container.scrollLeft = focusX * width + stage.offsetLeft - anchorX;
    container.scrollTop = focusY * height + stage.offsetTop - anchorY;
  }

  /** Scrolls smoothly so that the given scene point is in the middle (when the picture is bigger than the screen). */
  centerOn(sceneX, sceneY) {
    const { container, stage } = this;
    const isScrollable = stage.offsetWidth > container.clientWidth || stage.offsetHeight > container.clientHeight;
    if (!isScrollable) return;
    const pixelsPerUnit = this.stage.offsetWidth / SCENE.width;
    this.container.scrollTo({
      left: sceneX * pixelsPerUnit - this.container.clientWidth / 2,
      top: sceneY * pixelsPerUnit - this.container.clientHeight / 2,
      behavior: 'smooth',
    });
  }

  /** Picture width at zoom 1: the whole picture on desktop, the full screen height on touch devices. */
  fitWidth() {
    const widthToFitWidth = this.container.clientWidth;
    const widthToFitHeight = (this.container.clientHeight * SCENE.width) / SCENE.height;
    return TOUCH_LAYOUT_QUERY.matches
      ? Math.max(widthToFitWidth, widthToFitHeight)
      : Math.min(widthToFitWidth, widthToFitHeight);
  }

  bindEvents() {
    window.addEventListener('resize', () => this.refit());
    this.container.addEventListener('wheel', (event) => this.handleWheel(event), { passive: false });
    this.stage.addEventListener('pointerdown', (event) => this.startDrag(event));
    window.addEventListener('pointermove', (event) => this.moveDrag(event));
    window.addEventListener('pointerup', () => this.endDrag());
    this.stage.addEventListener('click', (event) => this.handleClick(event));
    this.container.addEventListener('touchstart', (event) => this.startPinch(event), { passive: true });
    this.container.addEventListener('touchmove', (event) => this.movePinch(event), { passive: false });
    this.container.addEventListener('touchend', (event) => this.endPinch(event));
    TOUCH_LAYOUT_QUERY.addEventListener?.('change', () => this.reset());
  }

  handleWheel(event) {
    if (!event.ctrlKey && !event.metaKey) return;
    event.preventDefault();
    const bounds = this.container.getBoundingClientRect();
    const factor = event.deltaY < 0 ? ZOOM.wheelStep : 1 / ZOOM.wheelStep;
    this.setZoom(this.zoom * factor, event.clientX - bounds.left, event.clientY - bounds.top);
  }

  // Mouse drag pans the picture; touch devices use native scrolling instead.
  startDrag(event) {
    if (event.pointerType !== 'mouse' || event.button !== 0) return;
    this.drag = {
      startX: event.clientX,
      startY: event.clientY,
      scrollLeft: this.container.scrollLeft,
      scrollTop: this.container.scrollTop,
      moved: false,
    };
  }

  moveDrag(event) {
    if (!this.drag) return;
    const dx = event.clientX - this.drag.startX;
    const dy = event.clientY - this.drag.startY;
    if (!this.drag.moved && Math.hypot(dx, dy) > DRAG_THRESHOLD_PX) {
      this.drag.moved = true;
      this.stage.classList.add('is-dragging');
    }
    if (this.drag.moved) {
      this.container.scrollLeft = this.drag.scrollLeft - dx;
      this.container.scrollTop = this.drag.scrollTop - dy;
    }
  }

  endDrag() {
    if (this.drag?.moved) {
      this.suppressNextClick = true;
      setTimeout(() => { this.suppressNextClick = false; }, 0);
    }
    this.drag = null;
    this.stage.classList.remove('is-dragging');
  }

  // Two-finger pinch zooms the picture (the browser's own page zoom is turned off for this area in CSS).
  startPinch(event) {
    if (event.touches.length !== 2) return;
    this.pinch = { distance: touchDistance(event.touches[0], event.touches[1]), zoom: this.zoom };
  }

  movePinch(event) {
    if (!this.pinch || event.touches.length !== 2) return;
    event.preventDefault();
    const [first, second] = event.touches;
    const bounds = this.container.getBoundingClientRect();
    const middleX = (first.clientX + second.clientX) / 2 - bounds.left;
    const middleY = (first.clientY + second.clientY) / 2 - bounds.top;
    this.setZoom((this.pinch.zoom * touchDistance(first, second)) / this.pinch.distance, middleX, middleY);
  }

  endPinch(event) {
    if (event.touches.length >= 2) return;
    if (this.pinch) {
      this.suppressNextClick = true;
      setTimeout(() => { this.suppressNextClick = false; }, 350);
    }
    this.pinch = null;
  }

  handleClick(event) {
    if (this.suppressNextClick) return;
    const bounds = this.stage.getBoundingClientRect();
    const x = ((event.clientX - bounds.left) * SCENE.width) / bounds.width;
    const y = ((event.clientY - bounds.top) * SCENE.height) / bounds.height;
    const isTouch = event.pointerType ? event.pointerType !== 'mouse' : TOUCH_LAYOUT_QUERY.matches;
    this.onSceneClick(x, y, { isTouch });
  }
}
