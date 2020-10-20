import React, { useContext, useReducer, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Entity } from 'aframe-react';
import cloneDeep from 'lodash/cloneDeep';
import * as d3 from 'd3';
import { json, csv, max, extent, scaleOrdinal, scalePoint, scaleBand, scaleLinear, scaleSequential, format, schemeCategory10, min } from 'd3';
import moment__default from 'moment';
import Ajv from 'ajv';
import isEqual from 'react-fast-compare';

(function () {
  function r(e, n, t) {
    function o(i, f) {
      if (!n[i]) {
        if (!e[i]) {
          var c = "function" === typeof require && require;
          if (!f && c) return c(i, !0);
          if (u) return u(i, !0);
          var a = new Error("Cannot find module '" + i + "'");
          throw a.code = "MODULE_NOT_FOUND", a;
        }

        var p = n[i] = {
          exports: {}
        };
        e[i][0].call(p.exports, function (r) {
          var n = e[i][1][r];
          return o(n || r);
        }, p, p.exports, r, e, n, t);
      }

      return n[i].exports;
    }

    for (var u = "function" === typeof require && require, i = 0; i < t.length; i++) o(t[i]);

    return o;
  }

  return r;
})()({
  1: [function (require, module, exports) {
    if (typeof AFRAME === 'undefined') {
      throw new Error('Component attempted to register before AFRAME was available.');
    }

    require('./systems/super-hands-system.js');

    require('./reaction_components/hoverable.js');

    require('./reaction_components/grabbable.js');

    require('./reaction_components/stretchable.js');

    require('./reaction_components/drag-droppable.js');

    require('./reaction_components/draggable.js');

    require('./reaction_components/droppable.js');

    require('./reaction_components/clickable.js');

    AFRAME.registerComponent('super-hands', {
      schema: {
        colliderEvent: {
          default: 'hit'
        },
        colliderEventProperty: {
          default: 'el'
        },
        colliderEndEvent: {
          default: 'hitend'
        },
        colliderEndEventProperty: {
          default: 'el'
        },
        grabStartButtons: {
          default: ['gripdown', 'trackpaddown', 'triggerdown', 'gripclose', 'abuttondown', 'bbuttondown', 'xbuttondown', 'ybuttondown', 'pointup', 'thumbup', 'pointingstart', 'pistolstart', 'thumbstickdown', 'mousedown', 'touchstart']
        },
        grabEndButtons: {
          default: ['gripup', 'trackpadup', 'triggerup', 'gripopen', 'abuttonup', 'bbuttonup', 'xbuttonup', 'ybuttonup', 'pointdown', 'thumbdown', 'pointingend', 'pistolend', 'thumbstickup', 'mouseup', 'touchend']
        },
        stretchStartButtons: {
          default: ['gripdown', 'trackpaddown', 'triggerdown', 'gripclose', 'abuttondown', 'bbuttondown', 'xbuttondown', 'ybuttondown', 'pointup', 'thumbup', 'pointingstart', 'pistolstart', 'thumbstickdown', 'mousedown', 'touchstart']
        },
        stretchEndButtons: {
          default: ['gripup', 'trackpadup', 'triggerup', 'gripopen', 'abuttonup', 'bbuttonup', 'xbuttonup', 'ybuttonup', 'pointdown', 'thumbdown', 'pointingend', 'pistolend', 'thumbstickup', 'mouseup', 'touchend']
        },
        dragDropStartButtons: {
          default: ['gripdown', 'trackpaddown', 'triggerdown', 'gripclose', 'abuttondown', 'bbuttondown', 'xbuttondown', 'ybuttondown', 'pointup', 'thumbup', 'pointingstart', 'pistolstart', 'thumbstickdown', 'mousedown', 'touchstart']
        },
        dragDropEndButtons: {
          default: ['gripup', 'trackpadup', 'triggerup', 'gripopen', 'abuttonup', 'bbuttonup', 'xbuttonup', 'ybuttonup', 'pointdown', 'thumbdown', 'pointingend', 'pistolend', 'thumbstickup', 'mouseup', 'touchend']
        },
        interval: {
          default: 0
        }
      },
      multiple: false,
      init: function () {
        this.HOVER_EVENT = 'hover-start';
        this.UNHOVER_EVENT = 'hover-end';
        this.GRAB_EVENT = 'grab-start';
        this.UNGRAB_EVENT = 'grab-end';
        this.STRETCH_EVENT = 'stretch-start';
        this.UNSTRETCH_EVENT = 'stretch-end';
        this.DRAG_EVENT = 'drag-start';
        this.UNDRAG_EVENT = 'drag-end';
        this.DRAGOVER_EVENT = 'dragover-start';
        this.UNDRAGOVER_EVENT = 'dragover-end';
        this.DRAGDROP_EVENT = 'drag-drop';
        this.otherSuperHand = null;
        this.gehDragged = new Set();
        this.gehClicking = new Set();
        this.hoverEls = [];
        this.hoverElsIntersections = [];
        this.prevCheckTime = null;
        this.state = new Map();
        this.dragging = false;
        this.unHover = this.unHover.bind(this);
        this.unWatch = this.unWatch.bind(this);
        this.onHit = this.onHit.bind(this);
        this.onGrabStartButton = this.onGrabStartButton.bind(this);
        this.onGrabEndButton = this.onGrabEndButton.bind(this);
        this.onStretchStartButton = this.onStretchStartButton.bind(this);
        this.onStretchEndButton = this.onStretchEndButton.bind(this);
        this.onDragDropStartButton = this.onDragDropStartButton.bind(this);
        this.onDragDropEndButton = this.onDragDropEndButton.bind(this);
        this.system.registerMe(this);
      },
      update: function (oldData) {
        this.unRegisterListeners(oldData);
        this.registerListeners();
      },
      remove: function () {
        this.system.unregisterMe(this);
        this.unRegisterListeners();
        this.hoverEls.length = 0;

        if (this.state.get(this.HOVER_EVENT)) {
          this._unHover(this.state.get(this.HOVER_EVENT));
        }

        this.onGrabEndButton();
        this.onStretchEndButton();
        this.onDragDropEndButton();
      },
      tick: function () {
        function sorter(a, b) {
          const aDist = a.distance === null ? -1 : a.distance;
          const bDist = b.distance === null ? -1 : b.distance;

          if (aDist < bDist) {
            return 1;
          }

          if (bDist < aDist) {
            return -1;
          }

          return 0;
        }

        return function (time) {
          const data = this.data;
          const prevCheckTime = this.prevCheckTime;

          if (prevCheckTime && time - prevCheckTime < data.interval) {
            return;
          }

          this.prevCheckTime = time;
          let orderChanged = false;
          this.hoverElsIntersections.sort(sorter);

          for (let i = 0; i < this.hoverElsIntersections.length; i++) {
            if (this.hoverEls[i] !== this.hoverElsIntersections[i].object.el) {
              orderChanged = true;
              this.hoverEls[i] = this.hoverElsIntersections[i].object.el;
            }
          }

          if (orderChanged) {
            this.hover();
          }
        };
      }(),
      onGrabStartButton: function (evt) {
        let carried = this.state.get(this.GRAB_EVENT);
        this.dispatchMouseEventAll('mousedown', this.el);
        this.gehClicking = new Set(this.hoverEls);

        if (!carried) {
          carried = this.findTarget(this.GRAB_EVENT, {
            hand: this.el,
            buttonEvent: evt
          });

          if (carried) {
            this.state.set(this.GRAB_EVENT, carried);

            this._unHover(carried);
          }
        }
      },
      onGrabEndButton: function (evt) {
        const clickables = this.hoverEls.filter(h => this.gehClicking.has(h));
        const grabbed = this.state.get(this.GRAB_EVENT);
        const endEvt = {
          hand: this.el,
          buttonEvent: evt
        };
        this.dispatchMouseEventAll('mouseup', this.el);

        for (let i = 0; i < clickables.length; i++) {
          this.dispatchMouseEvent(clickables[i], 'click', this.el);
        }

        this.gehClicking.clear();

        if (grabbed && !this.emitCancelable(grabbed, this.UNGRAB_EVENT, endEvt)) {
          this.promoteHoveredEl(this.state.get(this.GRAB_EVENT));
          this.state.delete(this.GRAB_EVENT);
          this.hover();
        }
      },
      onStretchStartButton: function (evt) {
        let stretched = this.state.get(this.STRETCH_EVENT);

        if (!stretched) {
          stretched = this.findTarget(this.STRETCH_EVENT, {
            hand: this.el,
            buttonEvent: evt
          });

          if (stretched) {
            this.state.set(this.STRETCH_EVENT, stretched);

            this._unHover(stretched);
          }
        }
      },
      onStretchEndButton: function (evt) {
        const stretched = this.state.get(this.STRETCH_EVENT);
        const endEvt = {
          hand: this.el,
          buttonEvent: evt
        };

        if (stretched && !this.emitCancelable(stretched, this.UNSTRETCH_EVENT, endEvt)) {
          this.promoteHoveredEl(stretched);
          this.state.delete(this.STRETCH_EVENT);
          this.hover();
        }
      },
      onDragDropStartButton: function (evt) {
        let dragged = this.state.get(this.DRAG_EVENT);
        this.dragging = true;

        if (this.hoverEls.length) {
          this.gehDragged = new Set(this.hoverEls);
          this.dispatchMouseEventAll('dragstart', this.el);
        }

        if (!dragged) {
          if (this.state.get(this.GRAB_EVENT) && !this.emitCancelable(this.state.get(this.GRAB_EVENT), this.DRAG_EVENT, {
            hand: this.el,
            buttonEvent: evt
          })) {
            dragged = this.state.get(this.GRAB_EVENT);
          } else {
            dragged = this.findTarget(this.DRAG_EVENT, {
              hand: this.el,
              buttonEvent: evt
            });
          }

          if (dragged) {
            this.state.set(this.DRAG_EVENT, dragged);

            this._unHover(dragged);
          }
        }
      },
      onDragDropEndButton: function (evt) {
        const carried = this.state.get(this.DRAG_EVENT);
        this.dragging = false;
        this.gehDragged.forEach(carried => {
          this.dispatchMouseEvent(carried, 'dragend', this.el);
          this.dispatchMouseEventAll('drop', carried, true, true);
          this.dispatchMouseEventAll('dragleave', carried, true, true);
        });
        this.gehDragged.clear();

        if (carried) {
          const ddEvt = {
            hand: this.el,
            dropped: carried,
            on: null,
            buttonEvent: evt
          };
          const endEvt = {
            hand: this.el,
            buttonEvent: evt
          };
          const dropTarget = this.findTarget(this.DRAGDROP_EVENT, ddEvt, true);

          if (dropTarget) {
            ddEvt.on = dropTarget;
            this.emitCancelable(carried, this.DRAGDROP_EVENT, ddEvt);

            this._unHover(dropTarget);
          }

          if (!this.emitCancelable(carried, this.UNDRAG_EVENT, endEvt)) {
            this.promoteHoveredEl(carried);
            this.state.delete(this.DRAG_EVENT);
            this.hover();
          }
        }
      },
      processHitEl: function (hitEl, intersection) {
        const dist = intersection && intersection.distance;
        const sects = this.hoverElsIntersections;
        const hoverEls = this.hoverEls;
        const hitElIndex = this.hoverEls.indexOf(hitEl);
        let hoverNeedsUpdate = false;

        if (hitElIndex === -1) {
          hoverNeedsUpdate = true;

          if (dist != null) {
            let i = 0;

            while (i < sects.length && dist < sects[i].distance) {
              i++;
            }

            hoverEls.splice(i, 0, hitEl);
            sects.splice(i, 0, intersection);
          } else {
            hoverEls.push(hitEl);
            sects.push({
              object: {
                el: hitEl
              }
            });
          }

          this.dispatchMouseEvent(hitEl, 'mouseover', this.el);

          if (this.dragging && this.gehDragged.size) {
            this.gehDragged.forEach(dragged => {
              this.dispatchMouseEventAll('dragenter', dragged, true, true);
            });
          }
        }

        return hoverNeedsUpdate;
      },
      onHit: function (evt) {
        const hitEl = evt.detail[this.data.colliderEventProperty];
        let hoverNeedsUpdate = 0;

        if (!hitEl) {
          return;
        }

        if (Array.isArray(hitEl)) {
          for (let i = 0, sect; i < hitEl.length; i++) {
            sect = evt.detail.intersections && evt.detail.intersections[i];
            hoverNeedsUpdate += this.processHitEl(hitEl[i], sect);
          }
        } else {
          hoverNeedsUpdate += this.processHitEl(hitEl, null);
        }

        if (hoverNeedsUpdate) {
          this.hover();
        }
      },
      hover: function () {
        var hvrevt, hoverEl;

        if (this.state.has(this.HOVER_EVENT)) {
          this._unHover(this.state.get(this.HOVER_EVENT), true);
        }

        if (this.state.has(this.DRAGOVER_EVENT)) {
          this._unHover(this.state.get(this.DRAGOVER_EVENT), true);
        }

        if (this.dragging && this.state.get(this.DRAG_EVENT)) {
          hvrevt = {
            hand: this.el,
            hovered: hoverEl,
            carried: this.state.get(this.DRAG_EVENT)
          };
          hoverEl = this.findTarget(this.DRAGOVER_EVENT, hvrevt, true);

          if (hoverEl) {
            this.emitCancelable(this.state.get(this.DRAG_EVENT), this.DRAGOVER_EVENT, hvrevt);
            this.state.set(this.DRAGOVER_EVENT, hoverEl);
          }
        }

        if (!this.state.has(this.DRAGOVER_EVENT)) {
          hoverEl = this.findTarget(this.HOVER_EVENT, {
            hand: this.el
          }, true);

          if (hoverEl) {
            this.state.set(this.HOVER_EVENT, hoverEl);
          }
        }
      },
      unHover: function (evt) {
        const clearedEls = evt.detail[this.data.colliderEndEventProperty];

        if (clearedEls) {
          if (Array.isArray(clearedEls)) {
            clearedEls.forEach(el => this._unHover(el));
          } else {
            this._unHover(clearedEls);
          }
        }
      },
      _unHover: function (el, skipNextHover) {
        let unHovered = false;
        let evt;

        if (el === this.state.get(this.DRAGOVER_EVENT)) {
          this.state.delete(this.DRAGOVER_EVENT);
          unHovered = true;
          evt = {
            hand: this.el,
            hovered: el,
            carried: this.state.get(this.DRAG_EVENT)
          };
          this.emitCancelable(el, this.UNDRAGOVER_EVENT, evt);

          if (this.state.has(this.DRAG_EVENT)) {
            this.emitCancelable(this.state.get(this.DRAG_EVENT), this.UNDRAGOVER_EVENT, evt);
          }
        }

        if (el === this.state.get(this.HOVER_EVENT)) {
          this.state.delete(this.HOVER_EVENT);
          unHovered = true;
          this.emitCancelable(el, this.UNHOVER_EVENT, {
            hand: this.el
          });
        }

        if (unHovered && !skipNextHover) {
          this.hover();
        }
      },
      unWatch: function (evt) {
        const clearedEls = evt.detail[this.data.colliderEndEventProperty];

        if (clearedEls) {
          if (Array.isArray(clearedEls)) {
            clearedEls.forEach(el => this._unWatch(el));
          } else {
            this._unWatch(clearedEls);
          }
        }
      },
      _unWatch: function (target) {
        var hoverIndex = this.hoverEls.indexOf(target);

        if (hoverIndex !== -1) {
          this.hoverEls.splice(hoverIndex, 1);
          this.hoverElsIntersections.splice(hoverIndex, 1);
        }

        this.gehDragged.forEach(dragged => {
          this.dispatchMouseEvent(target, 'dragleave', dragged);
          this.dispatchMouseEvent(dragged, 'dragleave', target);
        });
        this.dispatchMouseEvent(target, 'mouseout', this.el);
      },
      registerListeners: function () {
        this.el.addEventListener(this.data.colliderEvent, this.onHit);
        this.el.addEventListener(this.data.colliderEndEvent, this.unWatch);
        this.el.addEventListener(this.data.colliderEndEvent, this.unHover);
        this.data.grabStartButtons.forEach(b => {
          this.el.addEventListener(b, this.onGrabStartButton);
        });
        this.data.stretchStartButtons.forEach(b => {
          this.el.addEventListener(b, this.onStretchStartButton);
        });
        this.data.dragDropStartButtons.forEach(b => {
          this.el.addEventListener(b, this.onDragDropStartButton);
        });
        this.data.dragDropEndButtons.forEach(b => {
          this.el.addEventListener(b, this.onDragDropEndButton);
        });
        this.data.stretchEndButtons.forEach(b => {
          this.el.addEventListener(b, this.onStretchEndButton);
        });
        this.data.grabEndButtons.forEach(b => {
          this.el.addEventListener(b, this.onGrabEndButton);
        });
      },
      unRegisterListeners: function (data) {
        data = data || this.data;

        if (Object.keys(data).length === 0) {
          return;
        }

        this.el.removeEventListener(data.colliderEvent, this.onHit);
        this.el.removeEventListener(data.colliderEndEvent, this.unHover);
        this.el.removeEventListener(data.colliderEndEvent, this.unWatch);
        data.grabStartButtons.forEach(b => {
          this.el.removeEventListener(b, this.onGrabStartButton);
        });
        data.grabEndButtons.forEach(b => {
          this.el.removeEventListener(b, this.onGrabEndButton);
        });
        data.stretchStartButtons.forEach(b => {
          this.el.removeEventListener(b, this.onStretchStartButton);
        });
        data.stretchEndButtons.forEach(b => {
          this.el.removeEventListener(b, this.onStretchEndButton);
        });
        data.dragDropStartButtons.forEach(b => {
          this.el.removeEventListener(b, this.onDragDropStartButton);
        });
        data.dragDropEndButtons.forEach(b => {
          this.el.removeEventListener(b, this.onDragDropEndButton);
        });
      },
      emitCancelable: function (target, name, detail) {
        var data, evt;
        detail = detail || {};
        data = {
          bubbles: true,
          cancelable: true,
          detail: detail
        };
        data.detail.target = data.detail.target || target;
        evt = new window.CustomEvent(name, data);
        return target.dispatchEvent(evt);
      },
      dispatchMouseEvent: function (target, name, relatedTarget) {
        var mEvt = new window.MouseEvent(name, {
          relatedTarget: relatedTarget
        });
        target.dispatchEvent(mEvt);
      },
      dispatchMouseEventAll: function (name, relatedTarget, filterUsed, alsoReverse) {
        let els = this.hoverEls;

        if (filterUsed) {
          els = els.filter(el => el !== this.state.get(this.GRAB_EVENT) && el !== this.state.get(this.DRAG_EVENT) && el !== this.state.get(this.STRETCH_EVENT) && !this.gehDragged.has(el));
        }

        if (alsoReverse) {
          for (let i = 0; i < els.length; i++) {
            this.dispatchMouseEvent(els[i], name, relatedTarget);
            this.dispatchMouseEvent(relatedTarget, name, els[i]);
          }
        } else {
          for (let i = 0; i < els.length; i++) {
            this.dispatchMouseEvent(els[i], name, relatedTarget);
          }
        }
      },
      findTarget: function (evType, detail, filterUsed) {
        var elIndex;
        var eligibleEls = this.hoverEls;

        if (filterUsed) {
          eligibleEls = eligibleEls.filter(el => el !== this.state.get(this.GRAB_EVENT) && el !== this.state.get(this.DRAG_EVENT) && el !== this.state.get(this.STRETCH_EVENT));
        }

        for (elIndex = eligibleEls.length - 1; elIndex >= 0; elIndex--) {
          if (!this.emitCancelable(eligibleEls[elIndex], evType, detail)) {
            return eligibleEls[elIndex];
          }
        }

        return null;
      },
      promoteHoveredEl: function (el) {
        var hoverIndex = this.hoverEls.indexOf(el);

        if (hoverIndex !== -1 && this.hoverElsIntersections[hoverIndex].distance === null) {
          this.hoverEls.splice(hoverIndex, 1);
          const sect = this.hoverElsIntersections.splice(hoverIndex, 1);
          this.hoverEls.push(el);
          this.hoverElsIntersections.push(sect[0]);
        }
      }
    });
  }, {
    "./reaction_components/clickable.js": 2,
    "./reaction_components/drag-droppable.js": 3,
    "./reaction_components/draggable.js": 4,
    "./reaction_components/droppable.js": 5,
    "./reaction_components/grabbable.js": 6,
    "./reaction_components/hoverable.js": 7,
    "./reaction_components/stretchable.js": 10,
    "./systems/super-hands-system.js": 11
  }],
  2: [function (require, module, exports) {
    const buttonCore = require('./prototypes/buttons-proto.js');

    AFRAME.registerComponent('clickable', AFRAME.utils.extendDeep({}, buttonCore, {
      schema: {
        onclick: {
          type: 'string'
        }
      },
      init: function () {
        this.CLICKED_STATE = 'clicked';
        this.CLICK_EVENT = 'grab-start';
        this.UNCLICK_EVENT = 'grab-end';
        this.clickers = [];
        this.start = this.start.bind(this);
        this.end = this.end.bind(this);
        this.el.addEventListener(this.CLICK_EVENT, this.start);
        this.el.addEventListener(this.UNCLICK_EVENT, this.end);
      },
      remove: function () {
        this.el.removeEventListener(this.CLICK_EVENT, this.start);
        this.el.removeEventListener(this.UNCLICK_EVENT, this.end);
      },
      start: function (evt) {
        if (evt.defaultPrevented || !this.startButtonOk(evt)) {
          return;
        }

        this.el.addState(this.CLICKED_STATE);

        if (this.clickers.indexOf(evt.detail.hand) === -1) {
          this.clickers.push(evt.detail.hand);

          if (evt.preventDefault) {
            evt.preventDefault();
          }
        }
      },
      end: function (evt) {
        const handIndex = this.clickers.indexOf(evt.detail.hand);

        if (evt.defaultPrevented || !this.endButtonOk(evt)) {
          return;
        }

        if (handIndex !== -1) {
          this.clickers.splice(handIndex, 1);
        }

        if (this.clickers.length < 1) {
          this.el.removeState(this.CLICKED_STATE);
        }

        if (evt.preventDefault) {
          evt.preventDefault();
        }
      }
    }));
  }, {
    "./prototypes/buttons-proto.js": 8
  }],
  3: [function (require, module, exports) {
    const inherit = AFRAME.utils.extendDeep;

    const buttonCore = require('./prototypes/buttons-proto.js');

    AFRAME.registerComponent('drag-droppable', inherit({}, buttonCore, {
      init: function () {
        console.warn('Warning: drag-droppable is deprecated. Use draggable and droppable components instead');
        this.HOVERED_STATE = 'dragover';
        this.DRAGGED_STATE = 'dragged';
        this.HOVER_EVENT = 'dragover-start';
        this.UNHOVER_EVENT = 'dragover-end';
        this.DRAG_EVENT = 'drag-start';
        this.UNDRAG_EVENT = 'drag-end';
        this.DRAGDROP_EVENT = 'drag-drop';
        this.hoverStart = this.hoverStart.bind(this);
        this.dragStart = this.dragStart.bind(this);
        this.hoverEnd = this.hoverEnd.bind(this);
        this.dragEnd = this.dragEnd.bind(this);
        this.dragDrop = this.dragDrop.bind(this);
        this.el.addEventListener(this.HOVER_EVENT, this.hoverStart);
        this.el.addEventListener(this.DRAG_EVENT, this.dragStart);
        this.el.addEventListener(this.UNHOVER_EVENT, this.hoverEnd);
        this.el.addEventListener(this.UNDRAG_EVENT, this.dragEnd);
        this.el.addEventListener(this.DRAGDROP_EVENT, this.dragDrop);
      },
      remove: function () {
        this.el.removeEventListener(this.HOVER_EVENT, this.hoverStart);
        this.el.removeEventListener(this.DRAG_EVENT, this.dragStart);
        this.el.removeEventListener(this.UNHOVER_EVENT, this.hoverEnd);
        this.el.removeEventListener(this.UNDRAG_EVENT, this.dragEnd);
        this.el.removeEventListener(this.DRAGDROP_EVENT, this.dragDrop);
      },
      hoverStart: function (evt) {
        this.el.addState(this.HOVERED_STATE);

        if (evt.preventDefault) {
          evt.preventDefault();
        }
      },
      dragStart: function (evt) {
        if (!this.startButtonOk(evt)) {
          return;
        }

        this.el.addState(this.DRAGGED_STATE);

        if (evt.preventDefault) {
          evt.preventDefault();
        }
      },
      hoverEnd: function (evt) {
        this.el.removeState(this.HOVERED_STATE);
      },
      dragEnd: function (evt) {
        if (!this.endButtonOk(evt)) {
          return;
        }

        this.el.removeState(this.DRAGGED_STATE);

        if (evt.preventDefault) {
          evt.preventDefault();
        }
      },
      dragDrop: function (evt) {
        if (!this.endButtonOk(evt)) {
          return;
        }

        if (evt.preventDefault) {
          evt.preventDefault();
        }
      }
    }));
  }, {
    "./prototypes/buttons-proto.js": 8
  }],
  4: [function (require, module, exports) {
    const inherit = AFRAME.utils.extendDeep;

    const buttonCore = require('./prototypes/buttons-proto.js');

    AFRAME.registerComponent('draggable', inherit({}, buttonCore, {
      init: function () {
        this.DRAGGED_STATE = 'dragged';
        this.DRAG_EVENT = 'drag-start';
        this.UNDRAG_EVENT = 'drag-end';
        this.dragStartBound = this.dragStart.bind(this);
        this.dragEndBound = this.dragEnd.bind(this);
        this.el.addEventListener(this.DRAG_EVENT, this.dragStartBound);
        this.el.addEventListener(this.UNDRAG_EVENT, this.dragEndBound);
      },
      remove: function () {
        this.el.removeEventListener(this.DRAG_EVENT, this.dragStart);
        this.el.removeEventListener(this.UNDRAG_EVENT, this.dragEnd);
      },
      dragStart: function (evt) {
        if (evt.defaultPrevented || !this.startButtonOk(evt)) {
          return;
        }

        this.el.addState(this.DRAGGED_STATE);

        if (evt.preventDefault) {
          evt.preventDefault();
        }
      },
      dragEnd: function (evt) {
        if (evt.defaultPrevented || !this.endButtonOk(evt)) {
          return;
        }

        this.el.removeState(this.DRAGGED_STATE);

        if (evt.preventDefault) {
          evt.preventDefault();
        }
      }
    }));
  }, {
    "./prototypes/buttons-proto.js": 8
  }],
  5: [function (require, module, exports) {
    function elementMatches(el, selector) {
      if (el.matches) {
        return el.matches(selector);
      }

      if (el.msMatchesSelector) {
        return el.msMatchesSelector(selector);
      }

      if (el.webkitMatchesSelector) {
        return el.webkitMatchesSelector(selector);
      }
    }

    AFRAME.registerComponent('droppable', {
      schema: {
        accepts: {
          default: ''
        },
        autoUpdate: {
          default: true
        },
        acceptEvent: {
          default: ''
        },
        rejectEvent: {
          default: ''
        }
      },
      multiple: true,
      init: function () {
        this.HOVERED_STATE = 'dragover';
        this.HOVER_EVENT = 'dragover-start';
        this.UNHOVER_EVENT = 'dragover-end';
        this.DRAGDROP_EVENT = 'drag-drop';
        this.hoverStartBound = this.hoverStart.bind(this);
        this.hoverEndBound = this.hoverEnd.bind(this);
        this.dragDropBound = this.dragDrop.bind(this);
        this.mutateAcceptsBound = this.mutateAccepts.bind(this);
        this.acceptableEntities = [];
        this.observer = new window.MutationObserver(this.mutateAcceptsBound);
        this.observerOpts = {
          childList: true,
          subtree: true
        };
        this.el.addEventListener(this.HOVER_EVENT, this.hoverStartBound);
        this.el.addEventListener(this.UNHOVER_EVENT, this.hoverEndBound);
        this.el.addEventListener(this.DRAGDROP_EVENT, this.dragDropBound);
      },
      update: function () {
        if (this.data.accepts.length) {
          this.acceptableEntities = Array.prototype.slice.call(this.el.sceneEl.querySelectorAll(this.data.accepts));
        } else {
          this.acceptableEntities = null;
        }

        if (this.data.autoUpdate && this.acceptableEntities != null) {
          this.observer.observe(this.el.sceneEl, this.observerOpts);
        } else {
          this.observer.disconnect();
        }
      },
      remove: function () {
        this.el.removeEventListener(this.HOVER_EVENT, this.hoverStartBound);
        this.el.removeEventListener(this.UNHOVER_EVENT, this.hoverEndBound);
        this.el.removeEventListener(this.DRAGDROP_EVENT, this.dragDropBound);
        this.observer.disconnect();
      },
      mutateAccepts: function (mutations) {
        const query = this.data.accepts;
        mutations.forEach(mutation => {
          mutation.addedNodes.forEach(added => {
            if (elementMatches(added, query)) {
              this.acceptableEntities.push(added);
            }
          });
        });
      },
      entityAcceptable: function (entity) {
        const acceptableEntities = this.acceptableEntities;

        if (acceptableEntities === null) {
          return true;
        }

        for (let item of acceptableEntities) {
          if (item === entity) {
            return true;
          }
        }

        return false;
      },
      hoverStart: function (evt) {
        if (evt.defaultPrevented || !this.entityAcceptable(evt.detail.carried)) {
          return;
        }

        this.el.addState(this.HOVERED_STATE);

        if (evt.preventDefault) {
          evt.preventDefault();
        }
      },
      hoverEnd: function (evt) {
        if (evt.defaultPrevented) {
          return;
        }

        this.el.removeState(this.HOVERED_STATE);
      },
      dragDrop: function (evt) {
        if (evt.defaultPrevented) {
          return;
        }

        const dropped = evt.detail.dropped;

        if (!this.entityAcceptable(dropped)) {
          if (this.data.rejectEvent.length) {
            this.el.emit(this.data.rejectEvent, {
              el: dropped
            });
          }

          return;
        }

        if (this.data.acceptEvent.length) {
          this.el.emit(this.data.acceptEvent, {
            el: dropped
          });
        }

        if (evt.preventDefault) {
          evt.preventDefault();
        }
      }
    });
  }, {}],
  6: [function (require, module, exports) {
    const inherit = AFRAME.utils.extendDeep;

    const physicsCore = require('./prototypes/physics-grab-proto.js');

    const buttonsCore = require('./prototypes/buttons-proto.js');

    const base = inherit({}, physicsCore, buttonsCore);
    AFRAME.registerComponent('grabbable', inherit(base, {
      schema: {
        maxGrabbers: {
          type: 'int',
          default: NaN
        },
        invert: {
          default: false
        },
        suppressX: {
          default: false
        },
        suppressY: {
          default: false
        },
        suppressZ: {
          default: false
        }
      },
      init: function () {
        this.GRABBED_STATE = 'grabbed';
        this.GRAB_EVENT = 'grab-start';
        this.UNGRAB_EVENT = 'grab-end';
        this.grabbed = false;
        this.grabbers = [];
        this.constraints = new Map();
        this.deltaPositionIsValid = false;
        this.grabDistance = undefined;
        this.grabDirection = {
          x: 0,
          y: 0,
          z: -1
        };
        this.grabOffset = {
          x: 0,
          y: 0,
          z: 0
        };
        this.destPosition = {
          x: 0,
          y: 0,
          z: 0
        };
        this.deltaPosition = new THREE.Vector3();
        this.targetPosition = new THREE.Vector3();
        this.physicsInit();
        this.el.addEventListener(this.GRAB_EVENT, e => this.start(e));
        this.el.addEventListener(this.UNGRAB_EVENT, e => this.end(e));
        this.el.addEventListener('mouseout', e => this.lostGrabber(e));
      },
      update: function () {
        this.physicsUpdate();
        this.xFactor = (this.data.invert ? -1 : 1) * !this.data.suppressX;
        this.yFactor = (this.data.invert ? -1 : 1) * !this.data.suppressY;
        this.zFactor = (this.data.invert ? -1 : 1) * !this.data.suppressZ;
      },
      tick: function () {
        var q = new THREE.Quaternion();
        var v = new THREE.Vector3();
        return function () {
          var entityPosition;

          if (this.grabber) {
            this.targetPosition.copy(this.grabDirection);
            this.targetPosition.applyQuaternion(this.grabber.object3D.getWorldQuaternion(q)).setLength(this.grabDistance).add(this.grabber.object3D.getWorldPosition(v)).add(this.grabOffset);

            if (this.deltaPositionIsValid) {
              this.deltaPosition.sub(this.targetPosition);
              entityPosition = this.el.getAttribute('position');
              this.destPosition.x = entityPosition.x - this.deltaPosition.x * this.xFactor;
              this.destPosition.y = entityPosition.y - this.deltaPosition.y * this.yFactor;
              this.destPosition.z = entityPosition.z - this.deltaPosition.z * this.zFactor;
              this.el.setAttribute('position', this.destPosition);
            } else {
              this.deltaPositionIsValid = true;
            }

            this.deltaPosition.copy(this.targetPosition);
          }
        };
      }(),
      remove: function () {
        this.el.removeEventListener(this.GRAB_EVENT, this.start);
        this.el.removeEventListener(this.UNGRAB_EVENT, this.end);
        this.physicsRemove();
      },
      start: function (evt) {
        if (evt.defaultPrevented || !this.startButtonOk(evt)) {
          return;
        }

        const grabAvailable = !Number.isFinite(this.data.maxGrabbers) || this.grabbers.length < this.data.maxGrabbers;

        if (this.grabbers.indexOf(evt.detail.hand) === -1 && grabAvailable) {
          if (!evt.detail.hand.object3D) {
            console.warn('grabbable entities must have an object3D');
            return;
          }

          this.grabbers.push(evt.detail.hand);

          if (!this.physicsStart(evt) && !this.grabber) {
            this.grabber = evt.detail.hand;
            this.resetGrabber();
          }

          if (evt.preventDefault) {
            evt.preventDefault();
          }

          this.grabbed = true;
          this.el.addState(this.GRABBED_STATE);
        }
      },
      end: function (evt) {
        const handIndex = this.grabbers.indexOf(evt.detail.hand);

        if (evt.defaultPrevented || !this.endButtonOk(evt)) {
          return;
        }

        if (handIndex !== -1) {
          this.grabbers.splice(handIndex, 1);
          this.grabber = this.grabbers[0];
        }

        this.physicsEnd(evt);

        if (!this.resetGrabber()) {
          this.grabbed = false;
          this.el.removeState(this.GRABBED_STATE);
        }

        if (evt.preventDefault) {
          evt.preventDefault();
        }
      },
      resetGrabber: function () {
        var objPos = new THREE.Vector3();
        var grabPos = new THREE.Vector3();
        return function () {
          let raycaster;

          if (!this.grabber) {
            return false;
          }

          raycaster = this.grabber.getAttribute('raycaster');
          this.deltaPositionIsValid = false;
          this.grabDistance = this.el.object3D.getWorldPosition(objPos).distanceTo(this.grabber.object3D.getWorldPosition(grabPos));

          if (raycaster) {
            this.grabDirection = raycaster.direction;
            this.grabOffset = raycaster.origin;
          }

          return true;
        };
      }(),
      lostGrabber: function (evt) {
        let i = this.grabbers.indexOf(evt.relatedTarget);

        if (i !== -1 && evt.relatedTarget !== this.grabber && !this.physicsIsConstrained(evt.relatedTarget)) {
          this.grabbers.splice(i, 1);
        }
      }
    }));
  }, {
    "./prototypes/buttons-proto.js": 8,
    "./prototypes/physics-grab-proto.js": 9
  }],
  7: [function (require, module, exports) {
    AFRAME.registerComponent('hoverable', {
      init: function () {
        this.HOVERED_STATE = 'hovered';
        this.HOVER_EVENT = 'hover-start';
        this.UNHOVER_EVENT = 'hover-end';
        this.hoverers = [];
        this.start = this.start.bind(this);
        this.end = this.end.bind(this);
        this.el.addEventListener(this.HOVER_EVENT, this.start);
        this.el.addEventListener(this.UNHOVER_EVENT, this.end);
      },
      remove: function () {
        this.el.removeEventListener(this.HOVER_EVENT, this.start);
        this.el.removeEventListener(this.UNHOVER_EVENT, this.end);
      },
      start: function (evt) {
        if (evt.defaultPrevented) {
          return;
        }

        this.el.addState(this.HOVERED_STATE);

        if (this.hoverers.indexOf(evt.detail.hand) === -1) {
          this.hoverers.push(evt.detail.hand);
        }

        if (evt.preventDefault) {
          evt.preventDefault();
        }
      },
      end: function (evt) {
        if (evt.defaultPrevented) {
          return;
        }

        var handIndex = this.hoverers.indexOf(evt.detail.hand);

        if (handIndex !== -1) {
          this.hoverers.splice(handIndex, 1);
        }

        if (this.hoverers.length < 1) {
          this.el.removeState(this.HOVERED_STATE);
        }
      }
    });
  }, {}],
  8: [function (require, module, exports) {
    module.exports = function () {
      function buttonIsValid(evt, buttonList) {
        return buttonList.length === 0 || buttonList.indexOf(evt.detail.buttonEvent.type) !== -1;
      }

      return {
        schema: {
          startButtons: {
            default: []
          },
          endButtons: {
            default: []
          }
        },
        startButtonOk: function (evt) {
          return buttonIsValid(evt, this.data['startButtons']);
        },
        endButtonOk: function (evt) {
          return buttonIsValid(evt, this.data['endButtons']);
        }
      };
    }();
  }, {}],
  9: [function (require, module, exports) {
    module.exports = {
      schema: {
        usePhysics: {
          default: 'ifavailable'
        }
      },
      physicsInit: function () {
        this.constraints = new Map();
      },
      physicsUpdate: function () {
        if (this.data.usePhysics === 'never' && this.constraints.size) {
          this.physicsClear();
        }
      },
      physicsRemove: function () {
        this.physicsClear();
      },
      physicsStart: function (evt) {
        if (this.data.usePhysics !== 'never' && this.el.body && evt.detail.hand.body && !this.constraints.has(evt.detail.hand)) {
          const newConId = Math.random().toString(36).substr(2, 9);
          this.el.setAttribute('constraint__' + newConId, {
            target: evt.detail.hand
          });
          this.constraints.set(evt.detail.hand, newConId);
          return true;
        }

        if (this.data.usePhysics === 'only') {
          return true;
        }

        return false;
      },
      physicsEnd: function (evt) {
        let constraintId = this.constraints.get(evt.detail.hand);

        if (constraintId) {
          this.el.removeAttribute('constraint__' + constraintId);
          this.constraints.delete(evt.detail.hand);
        }
      },
      physicsClear: function () {
        if (this.el.body) {
          for (let c of this.constraints.values()) {
            this.el.body.world.removeConstraint(c);
          }
        }

        this.constraints.clear();
      },
      physicsIsConstrained: function (el) {
        return this.constraints.has(el);
      },

      physicsIsGrabbing() {
        return this.constraints.size > 0;
      }

    };
  }, {}],
  10: [function (require, module, exports) {
    const inherit = AFRAME.utils.extendDeep;

    const buttonsCore = require('./prototypes/buttons-proto.js');

    const base = inherit({}, buttonsCore);
    AFRAME.registerComponent('stretchable', inherit(base, {
      schema: {
        usePhysics: {
          default: 'ifavailable'
        },
        invert: {
          default: false
        },
        physicsUpdateRate: {
          default: 100
        }
      },
      init: function () {
        this.STRETCHED_STATE = 'stretched';
        this.STRETCH_EVENT = 'stretch-start';
        this.UNSTRETCH_EVENT = 'stretch-end';
        this.stretched = false;
        this.stretchers = [];
        this.scale = new THREE.Vector3();
        this.handPos = new THREE.Vector3();
        this.otherHandPos = new THREE.Vector3();
        this.start = this.start.bind(this);
        this.end = this.end.bind(this);
        this.el.addEventListener(this.STRETCH_EVENT, this.start);
        this.el.addEventListener(this.UNSTRETCH_EVENT, this.end);
      },
      update: function (oldDat) {
        this.updateBodies = AFRAME.utils.throttleTick(this._updateBodies, this.data.physicsUpdateRate, this);
      },
      tick: function (time, timeDelta) {
        if (!this.stretched) {
          return;
        }

        this.scale.copy(this.el.getAttribute('scale'));
        this.stretchers[0].object3D.getWorldPosition(this.handPos);
        this.stretchers[1].object3D.getWorldPosition(this.otherHandPos);
        const currentStretch = this.handPos.distanceTo(this.otherHandPos);
        let deltaStretch = 1;

        if (this.previousStretch !== null && currentStretch !== 0) {
          deltaStretch = Math.pow(currentStretch / this.previousStretch, this.data.invert ? -1 : 1);
        }

        this.previousStretch = currentStretch;

        if (this.previousPhysicsStretch === null) {
          this.previousPhysicsStretch = currentStretch;
        }

        this.scale.multiplyScalar(deltaStretch);
        this.el.setAttribute('scale', this.scale);
        this.updateBodies(time, timeDelta);
      },
      remove: function () {
        this.el.removeEventListener(this.STRETCH_EVENT, this.start);
        this.el.removeEventListener(this.UNSTRETCH_EVENT, this.end);
      },
      start: function (evt) {
        if (this.stretched || this.stretchers.includes(evt.detail.hand) || !this.startButtonOk(evt) || evt.defaultPrevented) {
          return;
        }

        this.stretchers.push(evt.detail.hand);

        if (this.stretchers.length === 2) {
          this.stretched = true;
          this.previousStretch = null;
          this.previousPhysicsStretch = null;
          this.el.addState(this.STRETCHED_STATE);
        }

        if (evt.preventDefault) {
          evt.preventDefault();
        }
      },
      end: function (evt) {
        var stretcherIndex = this.stretchers.indexOf(evt.detail.hand);

        if (evt.defaultPrevented || !this.endButtonOk(evt)) {
          return;
        }

        if (stretcherIndex !== -1) {
          this.stretchers.splice(stretcherIndex, 1);
          this.stretched = false;
          this.el.removeState(this.STRETCHED_STATE);

          this._updateBodies();
        }

        if (evt.preventDefault) {
          evt.preventDefault();
        }
      },
      _updateBodies: function () {
        if (!this.el.body || this.data.usePhysics === 'never') {
          return;
        }

        const currentStretch = this.previousStretch;
        let deltaStretch = 1;

        if (this.previousPhysicsStretch !== null && currentStretch > 0) {
          deltaStretch = Math.pow(currentStretch / this.previousPhysicsStretch, this.data.invert ? -1 : 1);
        }

        this.previousPhysicsStretch = currentStretch;

        if (deltaStretch === 1) {
          return;
        }

        for (let c of this.el.childNodes) {
          this.stretchBody(c, deltaStretch);
        }

        this.stretchBody(this.el, deltaStretch);
      },
      stretchBody: function (el, deltaStretch) {
        if (!el.body) {
          return;
        }

        let physicsShape;
        let offset;

        for (let i = 0; i < el.body.shapes.length; i++) {
          physicsShape = el.body.shapes[i];

          if (physicsShape.halfExtents) {
            physicsShape.halfExtents.scale(deltaStretch, physicsShape.halfExtents);
            physicsShape.updateConvexPolyhedronRepresentation();
          } else if (physicsShape.radius) {
            physicsShape.radius *= deltaStretch;
            physicsShape.updateBoundingSphereRadius();
          } else if (!this.shapeWarned) {
            console.warn('Unable to stretch physics body: unsupported shape');
            this.shapeWarned = true;
          }

          offset = el.body.shapeOffsets[i];
          offset.scale(deltaStretch, offset);
        }

        el.body.updateBoundingRadius();
      }
    }));
  }, {
    "./prototypes/buttons-proto.js": 8
  }],
  11: [function (require, module, exports) {
    AFRAME.registerSystem('super-hands', {
      init: function () {
        this.superHands = [];
      },
      registerMe: function (comp) {
        if (this.superHands.length === 1) {
          this.superHands[0].otherSuperHand = comp;
          comp.otherSuperHand = this.superHands[0];
        }

        this.superHands.push(comp);
      },
      unregisterMe: function (comp) {
        var index = this.superHands.indexOf(comp);

        if (index !== -1) {
          this.superHands.splice(index, 1);
        }

        this.superHands.forEach(x => {
          if (x.otherSuperHand === comp) {
            x.otherSuperHand = null;
          }
        });
      }
    });
  }, {}]
}, {}, [1]);

function applyFilters(dataset, domainMap) {
  const filteredDataset = [];
  const marks = document.querySelectorAll('.vria-mark');
  marks.forEach(el => {
    el.setAttribute('visible', false);
    el.classList.remove('interactive');
  });
  dataset.forEach(row => {
    let filtersSatisfied = true;
    Object.keys(row).forEach(field => {
      if (domainMap.has(field)) {
        if (domainMap.get(field).length === 0) {
          filtersSatisfied = false;
        } else if (typeof domainMap.get(field)[0] === 'string') {
          if (!domainMap.get(field).includes(row[field])) {
            filtersSatisfied = false;
          }
        } else {
          if (row[field] < domainMap.get(field)[0] || row[field] > domainMap.get(field)[1]) {
            filtersSatisfied = false;
          }
        }
      }
    });

    if (filtersSatisfied) {
      filteredDataset.push(row);
      document.querySelectorAll(`.vria-${row.vriaid}`).forEach(el => {
        el.setAttribute('visible', true);
        el.classList.add('interactive');
      });
    }
  });
  return filteredDataset;
}

const visConfigCompiled = (state, payload) => {
  return { ...state,
    compiledConfig: payload.compiledConfig,
    parsedDataset: payload.dataset,
    filteredDataset: applyFilters(payload.dataset, payload.domainMap),
    initialDomainMap: cloneDeep(payload.domainMap),
    domainMap: payload.domainMap,
    scales: payload.scales
  };
};

function debug(msg, ...rest) {
  if (process.env.NODE_ENV === 'development') {
    console.log(`VRIA Debug:`, msg, ...rest);
  }
}

function warn(msg) {
  console.warn(`VRIA Warning: ${msg}`);
}

function error(msg, ...rest) {
  console.error(`VRIA Error: ${msg}`, ...rest);
  throw new Error(`VRIA Error: ${msg}`, msg);
}

function mode() {
  if (process.env.NODE_ENV === 'development') {
    console.log(`VRIA in development mode...`);
  }
}

var log = {
  debug,
  warn,
  error,
  mode
};

const filterData = (state, payload) => {
  const {
    value,
    field,
    bound,
    type
  } = payload;
  let filteredDomain;

  switch (type) {
    case 'legend':
      if (state.domainMap.get(field).includes(value)) {
        filteredDomain = state.domainMap.get(field).filter(v => v !== value);
      } else {
        if (state.initialDomainMap.get(field).includes(value)) {
          filteredDomain = state.domainMap.get(field);
          filteredDomain.push(value);
        } else {
          log.error(`filterData - Value not added, ${value} was not in original domain`);
        }
      }

      break;

    case 'axis':
      filteredDomain = state.domainMap.get(field);

      if (bound === 0) {
        if (value > state.initialDomainMap.get(field)[0]) {
          filteredDomain[bound] = value;
        } else {
          filteredDomain[bound] = state.initialDomainMap.get(field)[0];
        }
      } else {
        if (value < state.initialDomainMap.get(field)[1]) {
          filteredDomain[bound] = value;
        } else {
          filteredDomain[bound] = state.initialDomainMap.get(field)[1];
        }
      }

      break;
  }

  const newDomainMap = new Map(state.domainMap).set(field, filteredDomain);
  return { ...state,
    filteredDataset: applyFilters(state.parsedDataset, newDomainMap),
    domainMap: newDomainMap
  };
};

const setCallbacks = (state, payload) => {
  return { ...state,
    appCallback: payload.appCallback
  };
};

const markSelected = (state, payload) => {
  const selection = {
    dataMap: new Map(state.selection.dataMap),
    data: [],
    marks: []
  };

  const setMarkData = () => {
    const selectedRow = cloneDeep(state.filteredDataset.filter(el => el.vriaid === payload.id));
    delete selectedRow[0].vriaid;
    selection.dataMap.set(payload.vriaid, ...selectedRow);
  };

  if (state.selection.dataMap.has(payload.vriaid)) {
    selection.dataMap.delete(payload.vriaid);
  } else if (state.options.multiSelect === true || selection.dataMap.size === 0) {
    setMarkData();
  } else if (state.options.multiSelect === false && selection.dataMap.size === 1) {
    selection.dataMap.delete(selection.dataMap.keys().next().value);
    setMarkData();
  }

  selection.data = [...selection.dataMap.values()];
  selection.marks = [...selection.dataMap.keys()];
  document.querySelectorAll('[selected]').forEach(el => {
    el.setAttribute('color', el.getAttribute('initialColor'));
    el.removeAttribute('selected');
    el.removeAttribute('vria-only-selected-mark');

    if (el.getAttribute('wireframe')) {
      el.setAttribute('opacity', 0);
    }
  });

  if (selection.dataMap.size !== 0) {
    selection.dataMap.forEach((value, key) => {
      document.querySelectorAll(`.${key}`).forEach(el => {
        el.setAttribute('selected', true);
        el.setAttribute('color', state.options.selectColor);

        if (selection.dataMap.size === 1) {
          el.setAttribute('vria-only-selected-mark', true);
        }

        if (el.getAttribute('wireframe')) {
          el.setAttribute('opacity', 1);
        }
      });
    });
  }

  if (selection.dataMap.size === 1) {
    if (payload.showTooltip !== null && payload.showTooltip !== undefined) {
      const tooltip = payload.cursor;
      tooltip.setAttribute('height', payload.tooltipHeight);
      tooltip.setAttribute('visible', true);
      tooltip.setAttribute('text', { ...tooltip.getAttribute('text'),
        value: payload.tooltipContent
      });
    }
  }

  return { ...state,
    selection
  };
};

const setSelection = (state, payload) => {
  const clearSelection = {
    dataMap: new Map(),
    data: [],
    marks: []
  };
  let selection;

  if (Object.hasOwnProperty.call(payload, 'dataMap') && Object.hasOwnProperty.call(payload, 'data') && Object.hasOwnProperty.call(payload, 'marks')) {
    selection = cloneDeep(payload);
  } else {
    selection = clearSelection;
  }

  document.querySelectorAll('[selected]').forEach(el => {
    el.setAttribute('color', el.getAttribute('initialColor'));
    el.removeAttribute('selected');
    el.removeAttribute('vria-only-selected-mark');
  });

  if (selection.dataMap.size !== 0) {
    selection.dataMap.forEach((value, key) => {
      document.querySelectorAll(`.${key}`).forEach(el => {
        el.setAttribute('selected', true);
        el.setAttribute('color', state.options.selectColor);

        if (selection.dataMap.size === 1) {
          el.setAttribute('vria-only-selected-mark', true);
        }
      });
    });
  }

  return { ...state,
    selection
  };
};

const setFilters = (state, payload) => {
  return { ...state,
    filteredDataset: applyFilters(state.parsedDataset, payload),
    domainMap: cloneDeep(payload)
  };
};

const setAdditionalFilters = (state, payload) => {
  return { ...state,
    additionalFilters: payload
  };
};

const setOptions = (state, payload) => {
  return { ...state,
    options: { ...state.options,
      ...payload
    }
  };
};

const coreActions = {
  VIS_CONFIG_COMPILED: 'VIS_CONFIG_COMPILED',
  FILTER_DATA: 'FILTER_DATA',
  SET_CALLBACKS: 'SET_CALLBACKS',
  MARK_SELECTED: 'MARK_SELECTED',
  SET_SELECTION: 'SET_SELECTION',
  SET_FILTERS: 'SET_FILTERS',
  SET_ADDITIONAL_FILTERS: 'SET_ADDITIONAL_FILTERS',
  SET_OPTIONS: 'SET_OPTIONS'
};
var actionTypes = { ...coreActions
};

var actions = {
  visConfigCompiled,
  filterData,
  setCallbacks,
  markSelected,
  setSelection,
  setFilters,
  setAdditionalFilters,
  setOptions
};

const reducer = (state, {
  type,
  payload
}) => {
  log.debug('reducer', type, payload);

  switch (type) {
    case actionTypes.VIS_CONFIG_COMPILED:
      return actions.visConfigCompiled(state, payload);

    case actionTypes.FILTER_DATA:
      return actions.filterData(state, payload);

    case actionTypes.SET_CALLBACKS:
      return actions.setCallbacks(state, payload);

    case actionTypes.MARK_SELECTED:
      return actions.markSelected(state, payload);

    case actionTypes.SET_SELECTION:
      return actions.setSelection(state, payload);

    case actionTypes.SET_FILTERS:
      return actions.setFilters(state, payload);

    case actionTypes.SET_ADDITIONAL_FILTERS:
      return actions.setAdditionalFilters(state, payload);

    case actionTypes.SET_OPTIONS:
      return actions.setOptions(state, payload);

    default:
      log.debug(`reducer - Unknown action type: ${type}`);
      break;
  }
};

var initialState = {
  compiledConfig: null,
  parsedDataset: null,
  filteredDataset: null,
  domainMap: null,
  scales: null,
  selection: {
    dataMap: new Map(),
    values: [],
    marks: []
  }
};

const DispatchContext = React.createContext(null);

var view = {
	mark: {
		bar: {
			shape: "box"
		},
		point: {
			shape: "sphere",
			size: 0.012
		},
		tooltip: {
			on: {
				content: "data"
			},
			off: false
		}
	},
	encoding: {
		legend: {
			type: {
				gradient: {
					face: "back",
					orient: "top-right"
				},
				symbol: {
					face: "back",
					orient: "left"
				}
			},
			filter: false,
			ticks: true,
			tickCount: 2,
			x: 0,
			y: 0,
			z: 0,
			xrotation: 0,
			yrotation: 0,
			zrotation: 0
		},
		scale: {
			range: {
				color: {
					quantitative: "ramp",
					ordinal: "ordinal",
					nominal: "category",
					temporal: "ramp"
				},
				size: [
					0,
					0.2
				],
				length: [
					0,
					0.1
				],
				shape: [
					"sphere",
					"box",
					"tetrahedron",
					"torus",
					"cone"
				],
				shape2d: [
					"circle",
					"plane",
					"triangle",
					"ring"
				]
			},
			scheme: {
				ramp: "interpolateBlues",
				ordinal: "schemeBlues",
				category: "schemeSet1"
			},
			zero: true,
			paddingInner: 0.25,
			paddingOuter: 0.25,
			nice: true
		},
		axis: {
			titlePadding: 0.2,
			filter: false,
			face: {
				x: "front",
				y: "back",
				z: "left"
			},
			orient: {
				x: "bottom",
				y: "left",
				z: "bottom"
			},
			ticks: true,
			tickCount: 10,
			labels: true
		},
		timeUnit: {
			year: "YYYY",
			quarter: "Qo",
			month: "MMMM",
			date: "L",
			week: "w",
			day: "d",
			dayofyear: "DDD",
			hours: "LT",
			minutes: "hh:mm",
			seconds: "hh:mm:ss",
			milliseconds: "SSSS"
		}
	},
	titlePadding: 0.1,
	width: 1,
	height: 1,
	depth: 1,
	x: 0,
	y: 0,
	z: 0,
	xrotation: 0,
	yrotation: 0,
	zrotation: 0
};
var options = {
	userHeight: 1.6,
	handedness: "both",
	selections: false,
	multiSelect: false,
	cursorColor: "#FFFFFF",
	chartColor: "#000000",
	selectColor: "#00FF00"
};
var defaults = {
	view: view,
	options: options
};

const _moment = moment__default;

function parseDataset(config) {
  const {
    data,
    views
  } = config;
  const uniqueFields = new Set();
  const encodingMap = new Map();
  views.forEach(view => {
    Object.keys(view.encoding).forEach(channel => {
      if (!uniqueFields.has(view.encoding[channel].field)) {
        uniqueFields.add(view.encoding[channel].field);
        encodingMap.set(view.encoding[channel].field, view.encoding[channel]);
      }
    });
  });
  const SUPPORTED_FILE_TYPES = ['csv', 'json', 'txt', 'text'];
  const FILE_TYPE = typeof data.url === 'string' ? data.url.split('.').pop().toLowerCase() : 'json';
  let transformedDataset;

  if (SUPPORTED_FILE_TYPES.includes(FILE_TYPE)) {
    switch (FILE_TYPE) {
      case 'txt':
      case 'text':
      case 'csv':
        try {
          transformedDataset = csv(data.url, row => _transformRow(row, encodingMap));
        } catch (err) {
          log.error(`parseDataset - Error parsing dataset as ${FILE_TYPE}`, err);
        }

        break;

      case 'json':
      default:
        try {
          if (typeof data.url === 'string') {
            transformedDataset = json(data.url).then(d => d.map(row => _transformRow(row, encodingMap)));
          } else if (typeof data.values === 'object') {
            transformedDataset = Promise.resolve(data.values.map(row => _transformRow(row, encodingMap)));
          }
        } catch (err) {
          log.error('parseDataset - Error parsing dataset as JSON', err);
        }

        break;
    }
  } else {
    log.error(`parseDataset - Error parsing dataset. Unsupported file type: ${FILE_TYPE}`);
  }

  return {
    dataset: transformedDataset,
    uniqueFields
  };
}

function _transformRow(row, encodingMap) {
  encodingMap.forEach(encoding => {
    switch (encoding.type) {
      case 'quantitative':
        if (typeof row[encoding.field] === 'string') {
          if (row[encoding.field] === '') {
            row[encoding.field] = 0;
          } else {
            row[encoding.field] = +parseFloat(row[encoding.field].replace(',', '.'));
          }
        } else {
          row[encoding.field] = +row[encoding.field];
        }

        break;

      case 'temporal':
        if (encoding.timeUnit) {
          const {
            timeUnit: dfTimeUnit
          } = defaults.view.encoding;
          const timeUnits = new Map([['year', dfTimeUnit.year], ['quarter', dfTimeUnit.quarter], ['month', dfTimeUnit.month], ['date', dfTimeUnit.date], ['week', dfTimeUnit.week], ['day', dfTimeUnit.day], ['dayofyear', dfTimeUnit.dayofyear], ['hours', dfTimeUnit.hours], ['minutes', dfTimeUnit.minutes], ['seconds', dfTimeUnit.seconds], ['milliseconds', dfTimeUnit.milliseconds]]);
          const timeUnit = timeUnits.get(encoding.timeUnit);
          row[encoding.field] = _moment(new Date(row[encoding.field].toString())).format(timeUnit);
        } else {
          if (typeof row[encoding.field] !== 'string') row[encoding.field] = row[encoding.field].toString();
        }

        break;

      case 'nominal':
        if (typeof row[encoding.field] !== 'string') row[encoding.field] = row[encoding.field].toString();
        break;

      case 'ordinal':
        if (typeof row[encoding.field] !== 'string') row[encoding.field] = row[encoding.field].toString();
        break;
    }
  });
  return row;
}

var $schema = "http://json-schema.org/draft-07/schema#";
var title = "VRIA JSON Schema v1.0";
var description = "JSON Schema for validating VRIA vis-config files";
var type = "object";
var properties = {
	title: {
		$ref: "#title"
	},
	titlePadding: {
		$ref: "#titlePadding"
	},
	data: {
		$ref: "#data"
	},
	mark: {
		$ref: "#mark"
	},
	encoding: {
		$ref: "#encoding"
	},
	views: {
		$ref: "#views"
	},
	width: {
		$ref: "#width"
	},
	height: {
		$ref: "#height"
	},
	depth: {
		$ref: "#depth"
	},
	x: {
		$ref: "#xposition"
	},
	y: {
		$ref: "#yposition"
	},
	z: {
		$ref: "#zposition"
	},
	xrotation: {
		$ref: "#xrotation"
	},
	yrotation: {
		$ref: "#yrotation"
	},
	zrotation: {
		$ref: "#zrotation"
	},
	xrot: {
		$ref: "#xrotation"
	},
	yrot: {
		$ref: "#yrotation"
	},
	zrot: {
		$ref: "#zrotation"
	}
};
var required = [
	"data",
	"title"
];
var oneOf = [
	{
		required: [
			"views"
		]
	},
	{
		required: [
			"mark",
			"encoding"
		]
	}
];
var definitions = {
	title: {
		$id: "#title",
		type: [
			"string",
			"boolean"
		]
	},
	titlePadding: {
		$id: "#titlePadding",
		type: "number"
	},
	data: {
		$id: "#data",
		type: "object",
		properties: {
			url: {
				type: "string"
			},
			values: {
				type: "array"
			}
		},
		oneOf: [
			{
				required: [
					"url"
				]
			},
			{
				required: [
					"values"
				]
			}
		]
	},
	mark: {
		$id: "#mark",
		anyOf: [
			{
				$ref: "#markType"
			},
			{
				type: "object",
				properties: {
					type: {
						$ref: "#markType"
					},
					shape: {
						type: "string"
					},
					tooltip: {
						$ref: "#tooltip"
					}
				},
				required: [
					"type"
				]
			}
		]
	},
	markType: {
		$id: "#markType",
		type: "string",
		"enum": [
			"point",
			"bar"
		]
	},
	tooltip: {
		$id: "#tooltip",
		anyOf: [
			{
				type: "boolean"
			},
			{
				type: "object",
				properties: {
					content: {
						type: [
							"string",
							"array"
						]
					}
				},
				required: [
					"content"
				]
			}
		]
	},
	encoding: {
		$id: "#encoding",
		type: "object",
		properties: {
			x: {
				$ref: "#channel"
			},
			y: {
				$ref: "#channel"
			},
			z: {
				$ref: "#channel"
			},
			xoffset: {
				$ref: "#channel"
			},
			yoffset: {
				$ref: "#channel"
			},
			zoffset: {
				$ref: "#channel"
			},
			width: {
				$ref: "#channel"
			},
			height: {
				$ref: "#channel"
			},
			depth: {
				$ref: "#channel"
			},
			xrotation: {
				$ref: "#channel"
			},
			yrotation: {
				$ref: "#channel"
			},
			zrotation: {
				$ref: "#channel"
			},
			xrot: {
				$ref: "#channel"
			},
			yrot: {
				$ref: "#channel"
			},
			zrot: {
				$ref: "#channel"
			},
			size: {
				$ref: "#channel"
			},
			color: {
				$ref: "#channel"
			},
			opacity: {
				$ref: "#channel"
			},
			length: {
				$ref: "#channel"
			},
			shape: {
				$ref: "#channel"
			}
		}
	},
	channel: {
		$id: "#channel",
		type: "object",
		properties: {
			field: {
				type: "string"
			},
			timeUnit: {
				type: "string"
			},
			numberFormat: {
				$ref: "#numberFormat"
			},
			type: {
				type: "string",
				"enum": [
					"nominal",
					"ordinal",
					"quantitative",
					"temporal"
				]
			},
			value: {
				type: [
					"number",
					"string"
				]
			},
			scale: {
				$ref: "#scale"
			},
			axis: {
				$ref: "#axis"
			},
			legend: {
				$ref: "#legend"
			}
		},
		oneOf: [
			{
				required: [
					"type",
					"field"
				]
			},
			{
				required: [
					"value"
				]
			}
		]
	},
	scale: {
		$id: "#scale",
		type: "object",
		properties: {
			type: {
				type: "string",
				"enum": [
					"linear",
					"sequential",
					"band"
				]
			},
			domain: {
				type: "array",
				items: {
					type: [
						"number",
						"string"
					]
				}
			},
			range: {
				oneOf: [
					{
						type: "string",
						"enum": [
							"ramp",
							"ordinal",
							"category"
						]
					},
					{
						type: "array",
						items: {
							type: [
								"number",
								"string"
							]
						}
					}
				]
			},
			scheme: {
				type: [
					"string",
					"array"
				]
			},
			zero: {
				type: "boolean"
			},
			nice: {
				type: "boolean"
			},
			paddingInner: {
				type: "number"
			},
			paddingOuter: {
				type: "number"
			}
		}
	},
	axis: {
		$id: "#axis",
		oneOf: [
			{
				type: "boolean"
			},
			{
				type: "object",
				properties: {
					title: {
						$ref: "#title"
					},
					titlePadding: {
						$ref: "#titlePadding"
					},
					filter: {
						$ref: "#filter"
					},
					face: {
						$ref: "#face"
					},
					orient: {
						$ref: "#orient"
					},
					ticks: {
						$ref: "#ticks"
					},
					tickCount: {
						$ref: "#tickCount"
					},
					labels: {
						type: "boolean"
					}
				}
			}
		]
	},
	legend: {
		$id: "#legend",
		oneOf: [
			{
				type: "boolean"
			},
			{
				type: "object",
				properties: {
					title: {
						$ref: "#title"
					},
					filter: {
						$ref: "#filter"
					},
					type: {
						type: "string"
					},
					face: {
						$ref: "#face"
					},
					numberFormat: {
						$ref: "#numberFormat"
					},
					orient: {
						$ref: "#orient"
					},
					x: {
						$ref: "#xposition"
					},
					y: {
						$ref: "#yposition"
					},
					z: {
						$ref: "#zposition"
					},
					xrotation: {
						$ref: "#xrotation"
					},
					yrotation: {
						$ref: "#yrotation"
					},
					zrotation: {
						$ref: "#zrotation"
					},
					xrot: {
						$ref: "#xrotation"
					},
					yrot: {
						$ref: "#yrotation"
					},
					zrot: {
						$ref: "#zrotation"
					}
				}
			}
		]
	},
	views: {
		$id: "#views",
		type: "array",
		items: {
			type: "object",
			properties: {
				title: {
					$ref: "#title"
				},
				titlePadding: {
					$ref: "#titlePadding"
				},
				mark: {
					$ref: "#mark"
				},
				encoding: {
					$ref: "#encoding"
				},
				width: {
					$ref: "#width"
				},
				height: {
					$ref: "#height"
				},
				depth: {
					$ref: "#depth"
				},
				x: {
					$ref: "#xposition"
				},
				y: {
					$ref: "#yposition"
				},
				z: {
					$ref: "#zposition"
				},
				xrotation: {
					$ref: "#xrotation"
				},
				yrotation: {
					$ref: "#yrotation"
				},
				zrotation: {
					$ref: "#zrotation"
				},
				xrot: {
					$ref: "#xrotation"
				},
				yrot: {
					$ref: "#yrotation"
				},
				zrot: {
					$ref: "#zrotation"
				}
			},
			required: [
				"mark",
				"encoding"
			]
		}
	},
	filter: {
		$id: "#filter",
		type: "boolean"
	},
	face: {
		$id: "#face",
		type: "string",
		"enum": [
			"front",
			"back",
			"top",
			"bottom",
			"left",
			"right"
		]
	},
	orient: {
		$id: "#orient",
		type: "string",
		"enum": [
			"top-left",
			"top",
			"top-right",
			"right",
			"bottom-right",
			"bottom",
			"bottom-left",
			"left",
			"middle"
		]
	},
	ticks: {
		$id: "#ticks",
		type: "boolean"
	},
	tickCount: {
		$id: "#tickCount",
		type: "number",
		minimum: 2
	},
	numberFormat: {
		$id: "#numberFormat",
		type: "string"
	},
	values: {
		$id: "#values",
		type: "array",
		items: {
			type: [
				"string",
				"number"
			]
		}
	},
	width: {
		$id: "#width",
		type: "number"
	},
	height: {
		$id: "#height",
		type: "number"
	},
	depth: {
		$id: "#depth",
		type: "number"
	},
	xposition: {
		$id: "#xposition",
		type: "number"
	},
	yposition: {
		$id: "#yposition",
		type: "number"
	},
	zposition: {
		$id: "#zposition",
		type: "number"
	},
	xrotation: {
		$id: "#xrotation",
		type: "number"
	},
	yrotation: {
		$id: "#yrotation",
		type: "number"
	},
	zrotation: {
		$id: "#zrotation",
		type: "number"
	}
};
var schema = {
	$schema: $schema,
	title: title,
	description: description,
	type: type,
	properties: properties,
	required: required,
	oneOf: oneOf,
	definitions: definitions
};

function validateVisConfig(config) {
  if (typeof config !== 'object') {
    log.error(`ValidateVisConfig - Malformed vis-config passed to validator. Expected type: 'object', got '${typeof config}'.`);
  }

  const ajv = new Ajv({
    useDefaults: false,
    jsonPointers: true
  });
  const validate = ajv.compile(schema);
  const valid = validate(config);

  if (valid) {
    log.debug(`ValidateVisConfig - vis-config successfully validated`, config);
  } else {
    log.error(`ValidateVisConfig - vis-config validation failed`, ajv.errorsText(validate.errors), validate.errors);
  }

  return valid;
}

function compileVisConfig(config, additionalFilters = [], validated = false) {
  if (typeof config !== 'object') {
    log.error(`compileVisConfig - Malformed vis-config passed to compiler. Expected type: 'object', got '${typeof config}'.`);
  }

  let valid = false;

  if (validated) {
    valid = true;
  } else {
    try {
      valid = validateVisConfig(config);
    } catch (error) {
      log.error(error);
      return false;
    }
  }

  let compiledConfig;
  const domainMap = new Map();

  if (valid) {
    if (config.views === undefined) {
      compiledConfig = {
        data: cloneDeep(config.data),
        title: config.title,
        views: [cloneDeep(config)]
      };
      delete compiledConfig.views[0].data;
    } else {
      compiledConfig = cloneDeep(config);
    }

    const {
      dataset
    } = parseDataset(compiledConfig);
    return dataset.then(d => {
      const allScales = [];
      compiledConfig.views.forEach((view, i) => {
        ['x', 'y', 'z', 'width', 'height', 'depth', 'titlePadding'].forEach(el => {
          if (view[el] === undefined) {
            compiledConfig.views[i][el] = defaults.view[el];
          }
        });
        [['xrot', 'xrotation'], ['yrot', 'yrotation'], ['zrot', 'zrotation']].forEach(el => {
          if (view[el[0]] !== undefined) {
            compiledConfig.views[i][el[1]] = cloneDeep(view[el[0]]);
            delete compiledConfig.views[i][el[0]];
          } else if (view[el[0]] === undefined && view[el[1]] === undefined) {
            compiledConfig.views[i][el[1]] = defaults.view[el[1]];
          }
        });
        const markType = view.mark.type ?? view.mark;
        let markShape;

        switch (markType) {
          case 'bar':
            markShape = view.mark.shape ?? defaults.view.mark.bar.shape;
            break;

          case 'point':
          default:
            markShape = view.mark.shape ?? defaults.view.mark.point.shape;
            break;
        }

        let markTooltip;

        if (typeof view.mark.tooltip === 'object') {
          markTooltip = view.mark.tooltip;
        } else if (view.mark.tooltip === true) {
          markTooltip = defaults.view.mark.tooltip.on;
        } else {
          markTooltip = false;
        }

        compiledConfig.views[i].mark = {
          type: markType,
          shape: markShape,
          tooltip: markTooltip
        };

        const ranges = _getRanges(compiledConfig.views[i]);

        Object.keys(view.encoding).forEach(el => {
          var _view$encoding$el;

          if (view.encoding[el].scale === undefined) {
            compiledConfig.views[i].encoding[el].scale = {};
          }

          if (view.encoding[el].value === undefined) {
            compiledConfig.views[i].encoding[el].scale.range = ranges[el];
          }

          if (el === 'color') {
            if (view.encoding[el].scale.scheme === 'string' && d3[view.encoding[el].scale.scheme] === undefined) {
              log.error(`compileVisConfig - Invalid scheme: ${view.encoding[el].scale.scheme} - VRIA accepts schemes from d3-scale-chromatic: https://github.com/d3/d3-scale-chromatic, or an array of colours`);
            }

            if (typeof view.encoding[el].scale.range === 'string' && view.encoding[el].scale.scheme === undefined) {
              compiledConfig.views[i].encoding[el].scale.scheme = defaults.view.encoding.scale.scheme[defaults.view.encoding.scale.range.color[view.encoding[el].type]];
            }
          }

          if (view.encoding[el].type === 'quantitative' && view.encoding[el].scale.nice === undefined) {
            compiledConfig.views[i].encoding[el].scale.nice = defaults.view.encoding.scale.nice;
          }

          if (view.encoding[el].type === 'quantitative' && view.encoding[el].scale.zero === undefined) {
            compiledConfig.views[i].encoding[el].scale.zero = defaults.view.encoding.scale.zero;
          }

          if (['x', 'y', 'z'].includes(el) && view.encoding[el].type !== 'quantitative') {
            if (view.encoding[el].scale.paddingInner === undefined) {
              compiledConfig.views[i].encoding[el].scale.paddingInner = defaults.view.encoding.scale.paddingInner;
            }

            if (view.encoding[el].scale.paddingOuter === undefined) {
              compiledConfig.views[i].encoding[el].scale.paddingOuter = defaults.view.encoding.scale.paddingOuter;
            }
          }

          if (['x', 'y', 'z'].includes(el) && ((_view$encoding$el = view.encoding[el]) === null || _view$encoding$el === void 0 ? void 0 : _view$encoding$el.axis) !== false) {
            if (view.encoding[el].axis === undefined) {
              compiledConfig.views[i].encoding[el].axis = {};
            }

            if (view.encoding[el].axis.title === undefined) {
              compiledConfig.views[i].encoding[el].axis.title = view.encoding[el].field;
            }

            if (view.encoding[el].axis.titlePadding === undefined) {
              compiledConfig.views[i].encoding[el].axis.titlePadding = defaults.view.encoding.axis.titlePadding;
            }

            if (view.encoding[el].axis.filter === undefined) {
              compiledConfig.views[i].encoding[el].axis.filter = defaults.view.encoding.axis.filter;
            }

            if (view.encoding[el].axis.face === undefined) {
              compiledConfig.views[i].encoding[el].axis.face = defaults.view.encoding.axis.face[el];
            }

            if (view.encoding[el].axis.orient === undefined) {
              compiledConfig.views[i].encoding[el].axis.orient = defaults.view.encoding.axis.orient[el];
            }

            if (view.encoding[el].axis.ticks === undefined) {
              compiledConfig.views[i].encoding[el].axis.ticks = defaults.view.encoding.axis.ticks;
            }

            if (view.encoding[el].axis.tickCount === undefined) {
              compiledConfig.views[i].encoding[el].axis.tickCount = defaults.view.encoding.axis.tickCount;
            }

            if (view.encoding[el].axis.labels === undefined) {
              compiledConfig.views[i].encoding[el].axis.labels = defaults.view.encoding.axis.labels;
            }
          }

          if (['width', 'height', 'depth', 'xoffset', 'yoffset', 'zoffset', 'xrotation', 'yrotation', 'zrotation', 'size', 'color', 'opacity', 'length', 'shape'].includes(el) && view.encoding[el].legend !== false && view.encoding[el].value === undefined) {
            if (view.encoding[el].legend === undefined || view.encoding[el].legend === true) {
              compiledConfig.views[i].encoding[el].legend = {};
            }

            if (view.encoding[el].legend === undefined) {
              compiledConfig.views[i].encoding[el].legend = view.encoding[el].field;
            }

            if (view.encoding[el].legend.filter === undefined) {
              compiledConfig.views[i].encoding[el].legend.filter = defaults.view.encoding.legend.filter;
            }

            if (view.encoding[el].legend.face === undefined) {
              if (view.encoding[el].type === 'quantitative' && el === 'color') {
                compiledConfig.views[i].encoding[el].legend.face = defaults.view.encoding.legend.type.gradient.face;
              } else {
                compiledConfig.views[i].encoding[el].legend.face = defaults.view.encoding.legend.type.symbol.face;
              }
            }

            if (view.encoding[el].legend.orient === undefined) {
              if (view.encoding[el].type === 'quantitative' && el === 'color') {
                compiledConfig.views[i].encoding[el].legend.orient = defaults.view.encoding.legend.type.gradient.orient;
              } else {
                compiledConfig.views[i].encoding[el].legend.orient = defaults.view.encoding.legend.type.symbol.orient;
              }
            }

            if (view.encoding[el].legend.ticks === undefined) {
              compiledConfig.views[i].encoding[el].legend.ticks = defaults.view.encoding.legend.ticks;
            }

            if (view.encoding[el].legend.tickCount === undefined) {
              compiledConfig.views[i].encoding[el].legend.tickCount = defaults.view.encoding.legend.tickCount;
            }

            if (view.encoding[el].legend.x === undefined) {
              compiledConfig.views[i].encoding[el].legend.x = defaults.view.encoding.legend.x;
            }

            if (view.encoding[el].legend.y === undefined) {
              compiledConfig.views[i].encoding[el].legend.y = defaults.view.encoding.legend.y;
            }

            if (view.encoding[el].legend.z === undefined) {
              compiledConfig.views[i].encoding[el].legend.z = defaults.view.encoding.legend.z;
            }

            if (view.encoding[el].legend.xrotation === undefined) {
              compiledConfig.views[i].encoding[el].legend.xrotation = defaults.view.encoding.legend.xrotation;
            }

            if (view.encoding[el].legend.yrotation === undefined) {
              compiledConfig.views[i].encoding[el].legend.yrotation = defaults.view.encoding.legend.yrotation;
            }

            if (view.encoding[el].legend.zrotation === undefined) {
              compiledConfig.views[i].encoding[el].legend.zrotation = defaults.view.encoding.legend.zrotation;
            }
          }
        });

        const {
          domains
        } = _getDomains(compiledConfig.views[i], d);

        const scales = _getScales(compiledConfig.views[i], domains, ranges);

        allScales.push(scales);
        Object.keys(view.encoding).forEach(el => {
          if (view.encoding[el].value === undefined) {
            compiledConfig.views[i].encoding[el].scale.domain = allScales[i][el].domain();
            domainMap.set(view.encoding[el].field, allScales[i][el].domain());
          }
        });
      });

      if (additionalFilters) {
        additionalFilters.forEach(f => {
          const values = d.map(row => row[f.field]);
          domainMap.set(f.field, f.domain || (f.type === 'quantitative' ? f.zero ? [0, max(values)] : extent(values) : [...new Set(values)]));
        });
      }

      return {
        dataset: d,
        compiledConfig,
        domainMap,
        scales: allScales
      };
    });
  }
}

function _getDomains(view, dataset) {
  const {
    encoding
  } = view;
  const domains = {};
  const domainsWithFields = {};
  const channelFields = {};
  Object.keys(encoding).forEach(channel => {
    var _encoding$channel$sca, _encoding$channel, _encoding$channel$sca2;

    let domain;

    if ((_encoding$channel$sca = encoding[channel].scale) === null || _encoding$channel$sca === void 0 ? void 0 : _encoding$channel$sca.domain) {
      domain = encoding[channel].scale.domain;
    } else if ((_encoding$channel = encoding[channel]) === null || _encoding$channel === void 0 ? void 0 : _encoding$channel.value) {
      var _encoding$channel2;

      domain = (_encoding$channel2 = encoding[channel]) === null || _encoding$channel2 === void 0 ? void 0 : _encoding$channel2.value;
    } else {
      const values = dataset.map(row => row[encoding[channel].field]);

      switch (encoding[channel].type) {
        case 'quantitative':
          if (((_encoding$channel$sca2 = encoding[channel].scale) === null || _encoding$channel$sca2 === void 0 ? void 0 : _encoding$channel$sca2.zero) === true) {
            domain = [0, max(values)];
          } else {
            domain = extent(values);
          }

          break;

        case 'temporal':
        case 'nominal':
        case 'ordinal':
        default:
          domain = [...new Set(values)];
          break;
      }
    }

    domains[channel] = domain;
    domainsWithFields[encoding[channel].field] = domain;
    channelFields[channel] = encoding[channel].field;
  });
  return {
    domains,
    domainsWithFields,
    channelFields
  };
}

function _getRanges(view) {
  const {
    encoding
  } = view;
  const ranges = {};
  Object.keys(encoding).forEach(channel => {
    var _encoding$channel$sca3;

    let range;

    if ((_encoding$channel$sca3 = encoding[channel].scale) === null || _encoding$channel$sca3 === void 0 ? void 0 : _encoding$channel$sca3.range) {
      range = encoding[channel].scale.range;
    } else {
      switch (channel) {
        case 'x':
        case 'width':
          range = [0, view.width];
          break;

        case 'y':
        case 'height':
          range = [0, view.height];
          break;

        case 'z':
        case 'depth':
          range = [0, view.depth];
          break;

        case 'size':
          range = defaults.view.encoding.scale.range.size;
          break;

        case 'opacity':
          range = [0, 1];
          break;

        case 'length':
          range = defaults.view.encoding.scale.range.length;
          break;

        case 'color':
          range = defaults.view.encoding.scale.range.color[encoding[channel].type];
          break;

        case 'shape':
          range = defaults.view.encoding.scale.range.shape;
          break;
      }
    }

    ranges[channel] = range;
  });
  return ranges;
}

function _getScales(view, domains, ranges) {
  const {
    encoding
  } = view;
  const scales = {};
  Object.keys(encoding).forEach(channel => {
    var _encoding$channel3, _encoding$channel3$sc, _encoding$channel$sca7, _encoding$channel$sca11;

    let scale;

    if (encoding[channel].value) {
      scale = () => encoding[channel].value;
    } else {
      switch (encoding[channel].type) {
        case 'quantitative':
          switch (channel) {
            case 'color':
              if (((_encoding$channel3 = encoding[channel]) === null || _encoding$channel3 === void 0 ? void 0 : (_encoding$channel3$sc = _encoding$channel3.scale) === null || _encoding$channel3$sc === void 0 ? void 0 : _encoding$channel3$sc.scheme) !== undefined) {
                var _encoding$channel$sca4;

                if (typeof ((_encoding$channel$sca4 = encoding[channel].scale) === null || _encoding$channel$sca4 === void 0 ? void 0 : _encoding$channel$sca4.scheme) === 'string') {
                  var _encoding$channel$sca5;

                  scale = scaleSequential().domain(domains[channel]).interpolator(d3[(_encoding$channel$sca5 = encoding[channel].scale) === null || _encoding$channel$sca5 === void 0 ? void 0 : _encoding$channel$sca5.scheme]);
                } else {
                  var _encoding$channel$sca6;

                  scale = scaleLinear().domain(domains[channel]).range((_encoding$channel$sca6 = encoding[channel].scale) === null || _encoding$channel$sca6 === void 0 ? void 0 : _encoding$channel$sca6.scheme);
                }
              }

              break;

            default:
              scale = scaleLinear().domain(domains[channel]).range(ranges[channel]);
              break;
          }

          break;

        case 'temporal':
        case 'nominal':
        case 'ordinal':
        default:
          {
            const paddingInner = encoding[channel].scale.paddingInner;
            const paddingOuter = encoding[channel].scale.paddingOuter;

            switch (channel) {
              case 'x':
              case 'y':
              case 'z':
                switch (view.mark.type) {
                  case 'bar':
                    scale = scaleBand().domain(domains[channel]).paddingInner(paddingInner).paddingOuter(paddingOuter).range(ranges[channel]);
                    break;

                  case 'point':
                    scale = scalePoint().domain(domains[channel]).padding(paddingOuter).range(ranges[channel]);
                    break;
                }

                break;

              case 'color':
                if (((_encoding$channel$sca7 = encoding[channel].scale) === null || _encoding$channel$sca7 === void 0 ? void 0 : _encoding$channel$sca7.scheme) !== undefined) {
                  var _encoding$channel$sca8;

                  if (typeof ((_encoding$channel$sca8 = encoding[channel].scale) === null || _encoding$channel$sca8 === void 0 ? void 0 : _encoding$channel$sca8.scheme) === 'string') {
                    var _encoding$channel$sca9;

                    scale = scaleOrdinal().domain(domains[channel]).range(d3[(_encoding$channel$sca9 = encoding[channel].scale) === null || _encoding$channel$sca9 === void 0 ? void 0 : _encoding$channel$sca9.scheme]);
                  } else {
                    var _encoding$channel$sca10;

                    scale = scaleOrdinal().domain(domains[channel]).range((_encoding$channel$sca10 = encoding[channel].scale) === null || _encoding$channel$sca10 === void 0 ? void 0 : _encoding$channel$sca10.scheme);
                  }
                }

                break;

              case 'shape':
                scale = scaleOrdinal().domain(domains[channel]).range(encoding[channel].scale.range);
                break;

              default:
                scale = scaleOrdinal().domain(domains[channel]).range(ranges[channel]);
                break;
            }

            break;
          }
      }
    }

    if (((_encoding$channel$sca11 = encoding[channel].scale) === null || _encoding$channel$sca11 === void 0 ? void 0 : _encoding$channel$sca11.nice) === true) {
      scale = scale.nice();
    }

    scales[channel] = scale;
  });
  return scales;
}

const GradientLegend = ({
  options,
  channel,
  scales,
  color,
  legendTitle,
  posrot
}) => {
  var _color$scale;

  if (channel !== 'color') return null;
  const {
    xpos,
    ypos,
    zpos,
    xrot,
    yrot,
    zrot
  } = posrot;
  const background = /*#__PURE__*/React.createElement(Entity, {
    primitive: "a-plane",
    width: "0.3",
    height: "0.2",
    color: options.chartColor,
    opacity: "0.2",
    position: "0 0 0"
  });
  let minValue = scales.color.domain()[0];
  if (color.numberFormat !== undefined) minValue = format(color.numberFormat)(minValue);
  const min = /*#__PURE__*/React.createElement(Entity, {
    primitive: "a-text",
    width: "0.5",
    value: minValue,
    color: options.chartColor,
    side: "front",
    anchor: "align",
    align: "left",
    position: "-0.125 0.01 0.002"
  });
  let maxValue = scales.color.domain()[1];
  if (color.numberFormat !== undefined) maxValue = format(color.numberFormat)(maxValue);
  const max = /*#__PURE__*/React.createElement(Entity, {
    primitive: "a-text",
    width: "0.5",
    value: maxValue,
    color: options.chartColor,
    side: "front",
    anchor: "align",
    align: "right",
    position: "0.125 0.01 0.002"
  });
  const label = /*#__PURE__*/React.createElement(Entity, {
    primitive: "a-text",
    width: "0.5",
    value: legendTitle,
    color: options.chartColor,
    side: "front",
    anchor: "align",
    align: "center",
    position: "0 0.06 0.002"
  });
  const gradient = [];
  let scheme;

  if (typeof (color === null || color === void 0 ? void 0 : (_color$scale = color.scale) === null || _color$scale === void 0 ? void 0 : _color$scale.scheme) === 'string') {
    scheme = scaleSequential().domain([0, 1]).interpolator(d3[color.scale.scheme]);
  } else {
    scheme = scaleLinear().domain([0, 1]).range(color.scale.scheme);
  }

  for (var i = 0; i < 50; i++) {
    gradient.push( /*#__PURE__*/React.createElement(Entity, {
      key: `gradient${i}`,
      primitive: "a-plane",
      width: "0.005",
      height: "0.05",
      color: scheme(i / 50),
      position: `${-0.12 + 0.005 * i} -0.04 0.001`
    }));
  }

  return /*#__PURE__*/React.createElement(Entity, {
    rotation: {
      x: xrot,
      y: yrot,
      z: zrot
    },
    position: {
      x: xpos,
      y: ypos,
      z: zpos
    },
    className: "legend"
  }, background, label, min, max, gradient);
};

const SymbolLegend = ({
  view,
  channel,
  domainMap,
  customMarks,
  options,
  legendTitle,
  scales,
  posrot
}) => {
  if (view.encoding.color && view.encoding.shape) {
    if (view.encoding.color.field === view.encoding.shape.field) {
      if (channel !== 'color') return null;
    }
  }

  const dispatch = useContext(DispatchContext);
  const {
    xpos,
    ypos,
    zpos,
    xrot,
    yrot,
    zrot
  } = posrot;
  const legendWidth = 0.25;
  const legendHeight = 0.09 + scales[channel].domain().length * 0.04;
  const legendYPos = legendHeight / 2 - 0.05;
  const labels = scales[channel].domain().map((v, i) => {
    var _view$encoding$channe2, _view$encoding$channe3, _view$encoding$channe4, _view$encoding$channe5, _view$encoding$channe6, _view$encoding$channe7, _view$encoding$channe8, _view$encoding$channe9;

    let opacity = 1;
    let isChecked = true;
    const color = scales.color ? scales.color(v) : schemeCategory10[0];
    const shape = scales.shape ? scales.shape(v) : view.mark.shape;
    const topOffset = 0.015 + legendYPos - 0.055;
    const step = i * -0.04;

    if (domainMap.get(view.encoding[channel].field) && !domainMap.get(view.encoding[channel].field).includes(scales[channel].domain()[i])) {
      opacity = 0.5;
      isChecked = false;
    }

    const checked = /*#__PURE__*/React.createElement(Entity, null, /*#__PURE__*/React.createElement(Entity, {
      primitive: "a-plane",
      width: "0.004",
      height: "0.01",
      color: "#333333",
      position: {
        x: -0.0864,
        y: topOffset - 0.003 + step,
        z: 0.002
      },
      rotation: "0 0 45"
    }), /*#__PURE__*/React.createElement(Entity, {
      primitive: "a-plane",
      width: "0.004",
      height: "0.02",
      color: "#333333",
      position: {
        x: -0.078,
        y: topOffset + step,
        z: 0.002
      },
      rotation: "0 0 -45"
    }));
    const checkbox = /*#__PURE__*/React.createElement(Entity, null, isChecked ? checked : null, /*#__PURE__*/React.createElement(Entity, {
      className: "interactive",
      primitive: "a-plane",
      width: "0.025",
      height: "0.025",
      color: "#FFFFFF",
      opacity: "1",
      position: {
        x: -0.08,
        y: topOffset + step,
        z: 0.001
      },
      events: {
        mouseenter: e => {
          e.target.setAttribute('opacity', 0.5);
        },
        mouseleave: e => {
          e.target.setAttribute('opacity', 1);
        },
        click: e => {
          if (e.detail !== 0) {
            dispatch({
              type: actionTypes.FILTER_DATA,
              payload: {
                value: scales[channel].domain()[i],
                field: view.encoding[channel].field,
                bound: null,
                type: 'legend'
              }
            });
          }
        }
      }
    }));
    let mark;

    switch (shape) {
      case 'box':
        {
          var _view$encoding$channe;

          mark = /*#__PURE__*/React.createElement(Entity, {
            primitive: "a-plane",
            width: "0.025",
            height: "0.025",
            color: color,
            position: {
              x: ((_view$encoding$channe = view.encoding[channel].legend) === null || _view$encoding$channe === void 0 ? void 0 : _view$encoding$channe.filter) !== false ? -0.04 : -0.08,
              y: topOffset + step,
              z: 0.001
            },
            opacity: opacity
          });
          break;
        }

      case 'sphere':
        mark = /*#__PURE__*/React.createElement(Entity, {
          radius: "0.0125",
          primitive: "a-circle",
          color: color,
          position: {
            x: ((_view$encoding$channe2 = view.encoding[channel].legend) === null || _view$encoding$channe2 === void 0 ? void 0 : _view$encoding$channe2.filter) !== false ? -0.04 : -0.08,
            y: topOffset + step,
            z: 0.001
          }
        });
        break;

      case 'cone':
        mark = /*#__PURE__*/React.createElement(Entity, {
          primitive: "a-cone",
          "radius-top": "0",
          "radius-bottom": "0.01",
          color: color,
          position: {
            x: ((_view$encoding$channe3 = view.encoding[channel].legend) === null || _view$encoding$channe3 === void 0 ? void 0 : _view$encoding$channe3.filter) !== false ? -0.04 : -0.08,
            y: topOffset + step,
            z: 0.001
          }
        });
        break;

      case 'tetrahedron':
        mark = /*#__PURE__*/React.createElement(Entity, {
          primitive: "a-triangle",
          scale: "0.025 0.025 0.025",
          color: color,
          position: {
            x: ((_view$encoding$channe4 = view.encoding[channel].legend) === null || _view$encoding$channe4 === void 0 ? void 0 : _view$encoding$channe4.filter) !== false ? -0.04 : -0.08,
            y: topOffset + step,
            z: 0.001
          }
        });
        break;

      case 'torus':
        mark = /*#__PURE__*/React.createElement(Entity, {
          primitive: "a-torus",
          radius: "0.01",
          color: color,
          position: {
            x: ((_view$encoding$channe5 = view.encoding[channel].legend) === null || _view$encoding$channe5 === void 0 ? void 0 : _view$encoding$channe5.filter) !== false ? -0.04 : -0.08,
            y: topOffset + step,
            z: 0.001
          }
        });
        break;

      case 'cylinder':
        mark = /*#__PURE__*/React.createElement(Entity, {
          radius: 0.01,
          primitive: "a-circle",
          color: color,
          position: {
            x: ((_view$encoding$channe6 = view.encoding[channel].legend) === null || _view$encoding$channe6 === void 0 ? void 0 : _view$encoding$channe6.filter) !== false ? -0.04 : -0.08,
            y: topOffset + step,
            z: 0.001
          }
        });
        break;

      default:
        mark = /*#__PURE__*/React.createElement(Entity, {
          width: "0.025",
          height: "0.025",
          depth: "0.025",
          position: {
            x: ((_view$encoding$channe7 = view.encoding[channel].legend) === null || _view$encoding$channe7 === void 0 ? void 0 : _view$encoding$channe7.filter) !== false ? -0.04 : -0.08,
            y: topOffset + step,
            z: 0.001
          }
        }, customMarks[view.mark.shape]({
          width: 0.025,
          height: 0.025,
          depth: 0.025,
          size: 0.025,
          radius: 0.0125,
          color
        }));
        break;
    }

    return /*#__PURE__*/React.createElement(Entity, {
      key: `lC${i}`
    }, mark, ((_view$encoding$channe8 = view.encoding[channel].legend) === null || _view$encoding$channe8 === void 0 ? void 0 : _view$encoding$channe8.filter) !== false ? checkbox : null, /*#__PURE__*/React.createElement(Entity, {
      primitive: "a-text",
      width: "0.5",
      value: scales[channel].domain()[i],
      color: options.chartColor,
      side: "front",
      anchor: "align",
      align: "left",
      opacity: opacity,
      position: {
        x: ((_view$encoding$channe9 = view.encoding[channel].legend) === null || _view$encoding$channe9 === void 0 ? void 0 : _view$encoding$channe9.filter) !== false ? -0.02 : -0.06,
        y: topOffset + step,
        z: 0.001
      }
    }));
  });
  return /*#__PURE__*/React.createElement(Entity, {
    primitive: "a-plane",
    width: legendWidth,
    height: legendHeight,
    color: options.chartColor,
    opacity: "0.2",
    rotation: {
      x: xrot,
      y: yrot,
      z: zrot
    },
    position: {
      x: xpos,
      y: ypos,
      z: zpos
    }
  }, /*#__PURE__*/React.createElement(Entity, {
    primitive: "a-text",
    width: "0.5",
    value: `${legendTitle}`,
    color: options.chartColor,
    side: "front",
    anchor: "align",
    align: "left",
    position: `-0.09 ${legendYPos + 0.01} 0.001`
  }), labels);
};

const Legend = props => {
  var _view$encoding, _view$encoding$x, _view$encoding$x$axis, _c$legend;

  log.debug('Legend Rendering');
  const {
    view,
    channel,
    index,
    options,
    scales,
    domainMap,
    customMarks,
    rangesMax
  } = props;
  const c = view.encoding[channel];
  let xpos = c.legend.x || 0;
  let ypos = c.legend.y || 0;
  let zpos = c.legend.z || 0;
  const xrot = c.legend.xrot || c.legend.xrotation || 0;
  const yrot = c.legend.yrot || c.legend.yrotation || 0;
  const zrot = c.legend.zrot || c.legend.zrotation || 0;
  const {
    face,
    orient
  } = c.legend;
  const xoffsetLeft = 0.2 + (((_view$encoding = view.encoding) === null || _view$encoding === void 0 ? void 0 : (_view$encoding$x = _view$encoding.x) === null || _view$encoding$x === void 0 ? void 0 : (_view$encoding$x$axis = _view$encoding$x.axis) === null || _view$encoding$x$axis === void 0 ? void 0 : _view$encoding$x$axis.titlePadding) || 0);
  const xoffsetRight = 0.2;

  switch (face) {
    case 'front':
      zpos += rangesMax.z;

    case 'back':
      if (orient === 'bottom-left') {
        xpos -= xoffsetLeft;
      }

      if (orient === 'left') {
        ypos += rangesMax.y / 2;
        xpos -= xoffsetLeft;
      }

      if (orient === 'top-left') {
        ypos += rangesMax.y;
        xpos -= xoffsetLeft;
      }

      if (orient === 'top') {
        ypos += rangesMax.y;
        xpos += rangesMax.x / 2;
      }

      if (orient === 'top-right') {
        ypos += rangesMax.y;
        xpos += rangesMax.x + xoffsetRight;
      }

      if (orient === 'right') {
        ypos += rangesMax.y / 2;
        xpos += rangesMax.x + xoffsetRight;
      }

      if (orient === 'bottom-right') {
        xpos += rangesMax.x + xoffsetRight;
      }

      if (orient === 'bottom') {
        xpos += rangesMax.x / 2;
      }

      if (orient === 'middle') {
        xpos += rangesMax.x / 2;
        ypos += rangesMax.y / 2;
      }

      break;
  }

  const posrot = {
    xpos,
    ypos,
    zpos,
    xrot,
    yrot,
    zrot
  };
  const legendTitle = ((_c$legend = c.legend) === null || _c$legend === void 0 ? void 0 : _c$legend.title) || c.field;
  return c.type === 'quantitative' ? /*#__PURE__*/React.createElement(GradientLegend, {
    options: options,
    scales: scales,
    color: c,
    legendTitle: legendTitle,
    posrot: posrot,
    channel: channel
  }) : /*#__PURE__*/React.createElement(SymbolLegend, {
    view: view,
    domainMap: domainMap,
    customMarks: customMarks,
    options: options,
    legendTitle: legendTitle,
    scales: scales,
    posrot: posrot,
    channel: channel
  });
};

Legend.propTypes = {
  view: PropTypes.object.isRequired,
  options: PropTypes.object.isRequired,
  dataset: PropTypes.array.isRequired,
  scales: PropTypes.object.isRequired,
  domainMap: PropTypes.object.isRequired
};
var Legend$1 = React.memo(Legend, (prev, next) => prev.domainMap === next.domainMap);

const Axis = props => {
  const AxisLine = () => /*#__PURE__*/React.createElement(Entity, {
    opacity: props.opacity,
    line: {
      start: props.start,
      end: props.end,
      color: props.color
    }
  });

  return /*#__PURE__*/React.createElement(Entity, {
    position: props.position
  }, /*#__PURE__*/React.createElement(AxisLine, null), props.ticks, props.tickText, props.title);
};

Axis.propTypes = {
  start: PropTypes.string.isRequired,
  end: PropTypes.string.isRequired,
  color: PropTypes.string.isRequired,
  position: PropTypes.string,
  rotation: PropTypes.string
};
const XAxis = props => {
  const {
    scales,
    tickOffset,
    color,
    tickValues,
    rangesMax,
    numberFormat,
    title,
    titlePadding,
    labels,
    ticks
  } = props;

  const axisTicks = () => tickValues.map((tick, i) => /*#__PURE__*/React.createElement(Entity, {
    key: `xTicks${i}`,
    line: {
      start: `${scales.x(tick) + tickOffset} 0 ${rangesMax.z}`,
      end: `${scales.x(tick) + tickOffset} -0.025 ${rangesMax.z}`,
      color: color
    }
  }));

  const axisTickText = () => tickValues.map((tick, i) => {
    let value = tick;

    if (typeof value === 'number' && typeof numberFormat === 'string') {
      value = format(numberFormat)(tick);
    }

    return /*#__PURE__*/React.createElement(Entity, {
      key: `xTickText${i}`,
      text: {
        width: 0.6,
        value: value,
        color: color,
        side: 'front',
        anchor: 'align',
        align: 'right'
      },
      position: `${scales.x(tick) + tickOffset} -0.035 ${rangesMax.z}`,
      rotation: "0 0 90"
    });
  });

  const axisTitle = () => /*#__PURE__*/React.createElement(Entity, {
    text: {
      width: rangesMax.x,
      value: title,
      color: color,
      side: 'front',
      anchor: 'align',
      align: 'center'
    },
    position: `${rangesMax.x / 2} ${titlePadding !== null ? -titlePadding : -0.22} ${rangesMax.z}`,
    rotation: "0 0 0"
  });

  const showLabels = labels === false ? labels : defaults.view.encoding.axis.labels;
  const showTicks = ticks === false ? ticks : defaults.view.encoding.axis.ticks;
  return /*#__PURE__*/React.createElement(Axis, Object.assign({}, props, {
    axis: "x",
    start: `0 0 ${rangesMax.z}`,
    end: `${rangesMax.x} 0 ${rangesMax.z}`,
    color: color,
    ticks: showTicks ? axisTicks() : null,
    tickText: showTicks && showLabels ? axisTickText() : null,
    title: axisTitle()
  }));
};
const YAxis = props => {
  const {
    scales,
    tickOffset,
    color,
    tickValues,
    rangesMax,
    numberFormat,
    title,
    titlePadding,
    labels,
    ticks
  } = props;

  const axisTicks = () => tickValues.map((tick, i) => /*#__PURE__*/React.createElement(Entity, {
    key: `yTicks${i}`,
    line: {
      start: `0 ${scales.y(tick) + tickOffset} 0`,
      end: `-0.025 ${scales.y(tick) + tickOffset} 0`,
      color: color
    }
  }));

  const axisTickText = () => tickValues.map((tick, i) => {
    let value = tick;

    if (typeof value === 'number' && typeof numberFormat === 'string') {
      value = format(numberFormat)(tick);
    }

    return /*#__PURE__*/React.createElement(Entity, {
      key: `yTickText${i}`,
      text: {
        width: 0.6,
        value: value,
        color: color,
        side: 'front',
        anchor: 'align',
        align: 'right'
      },
      position: `-0.035 ${scales.y(tick) + tickOffset} 0`,
      rotation: "0 0 0"
    });
  });

  const axisTitle = () => /*#__PURE__*/React.createElement(Entity, {
    text: {
      width: rangesMax.y,
      value: title,
      color: color,
      side: 'front',
      anchor: 'align',
      align: 'center'
    },
    position: `${titlePadding !== null ? -titlePadding : -0.22} ${rangesMax.y / 2} 0`,
    rotation: "0 0 90"
  });

  const showLabels = labels === false ? labels : defaults.view.encoding.axis.labels;
  const showTicks = ticks === false ? ticks : defaults.view.encoding.axis.ticks;
  return /*#__PURE__*/React.createElement(Axis, Object.assign({}, props, {
    axis: "y",
    start: "0 0 0",
    end: `0 ${rangesMax.y} 0`,
    color: color,
    ticks: showTicks ? axisTicks() : null,
    tickText: showTicks && showLabels ? axisTickText() : null,
    title: axisTitle()
  }));
};
const ZAxis = props => {
  const {
    scales,
    tickOffset,
    color,
    tickValues,
    rangesMax,
    numberFormat,
    title,
    titlePadding,
    labels,
    ticks
  } = props;

  const axisTicks = () => tickValues.map((tick, i) => /*#__PURE__*/React.createElement(Entity, {
    key: `zTicks${i}`,
    line: {
      start: `0 0 ${scales.z(tick) + tickOffset}`,
      end: `0 -0.025 ${scales.z(tick) + tickOffset}`,
      color: color
    }
  }));

  const axisTickText = () => tickValues.map((tick, i) => {
    let value = tick;

    if (typeof value === 'number' && typeof numberFormat === 'string') {
      value = format(numberFormat)(tick);
    }

    return /*#__PURE__*/React.createElement(Entity, {
      key: `zTickText${i}`,
      text: {
        width: 0.6,
        value: value,
        color: color,
        side: 'front',
        anchor: 'align',
        align: 'right'
      },
      position: `0 -0.035 ${scales.z(tick) + tickOffset}`,
      rotation: "0 -90 90"
    });
  });

  const axisTitle = () => /*#__PURE__*/React.createElement(Entity, {
    text: {
      width: rangesMax.z,
      value: title,
      color: color,
      side: 'front',
      anchor: 'align',
      align: 'center'
    },
    position: `0 ${titlePadding !== null ? -titlePadding : -0.22} ${rangesMax.z / 2}`,
    rotation: "0 -90 0"
  });

  const showLabels = labels === false ? labels : defaults.view.encoding.axis.labels;
  const showTicks = ticks === false ? ticks : defaults.view.encoding.axis.ticks;
  return /*#__PURE__*/React.createElement(Axis, Object.assign({}, props, {
    axis: "z",
    start: "0 0 0",
    end: `0 0 ${rangesMax.z}`,
    color: color,
    ticks: showTicks ? axisTicks() : null,
    tickText: showTicks && showLabels ? axisTickText() : null,
    title: axisTitle()
  }));
};

const Axes = props => {
  log.debug('Axes Rendering');
  const {
    view,
    options,
    scales,
    rangesMax
  } = props;

  const generateTitle = () => {
    let title;

    if (view.title) {
      title = /*#__PURE__*/React.createElement(Entity, {
        text: {
          width: rangesMax.x,
          value: view.title,
          color: options.chartColor,
          side: 'front',
          anchor: 'align',
          align: 'center'
        },
        position: `${rangesMax.x / 2 || 0} ${rangesMax.y ? rangesMax.y + view.titlePadding : view.titlePadding} 0`
      });
    }

    return title;
  };

  const generateAxes = () => {
    const axes = [];
    ['x', 'y', 'z'].forEach(channel => {
      var _view$encoding$channe, _view$encoding$channe11, _view$encoding$channe12, _view$encoding$channe13, _view$encoding$channe14, _view$encoding$channe15, _view$encoding$channe16, _view$encoding$channe17, _view$encoding$channe18, _view$encoding$channe19, _view$encoding$channe20, _view$encoding$channe21, _view$encoding$channe22, _view$encoding$channe23, _view$encoding$channe24, _view$encoding$channe25, _view$encoding$channe26, _view$encoding$channe27, _view$encoding$channe28;

      if (view.encoding[channel] && ((_view$encoding$channe = view.encoding[channel]) === null || _view$encoding$channe === void 0 ? void 0 : _view$encoding$channe.axis) !== false) {
        var _view$encoding$channe2, _view$encoding$channe5, _view$encoding$channe6, _view$encoding$channe7, _view$encoding$channe8, _view$encoding$channe9, _view$encoding$channe10;

        let title;

        if (((_view$encoding$channe2 = view.encoding[channel].axis) === null || _view$encoding$channe2 === void 0 ? void 0 : _view$encoding$channe2.title) !== undefined) {
          title = view.encoding[channel].axis.title;
        } else {
          title = view.encoding[channel].field;
        }

        let tickValues;
        let tickOffset = 0;
        let tickCount = null;

        if (view.encoding[channel].type === 'quantitative') {
          var _view$encoding$channe3, _view$encoding$channe4;

          tickCount = ((_view$encoding$channe3 = view.encoding[channel]) === null || _view$encoding$channe3 === void 0 ? void 0 : (_view$encoding$channe4 = _view$encoding$channe3.axis) === null || _view$encoding$channe4 === void 0 ? void 0 : _view$encoding$channe4.tickCount) || tickCount;

          if (tickCount !== null) {
            tickValues = scales[channel].ticks(tickCount);
          } else {
            tickValues = scales[channel].ticks();
          }
        } else {
          tickValues = scales[channel].domain();
          tickOffset = scales[channel].bandwidth() / 2;
        }

        let xFace = ((_view$encoding$channe5 = view.encoding[channel]) === null || _view$encoding$channe5 === void 0 ? void 0 : (_view$encoding$channe6 = _view$encoding$channe5.axis) === null || _view$encoding$channe6 === void 0 ? void 0 : _view$encoding$channe6.face) || defaults.view.encoding.axis.face.x;
        xFace = xFace === 'front' ? 0 : -rangesMax.z;
        let yFace = ((_view$encoding$channe7 = view.encoding[channel]) === null || _view$encoding$channe7 === void 0 ? void 0 : (_view$encoding$channe8 = _view$encoding$channe7.axis) === null || _view$encoding$channe8 === void 0 ? void 0 : _view$encoding$channe8.face) || defaults.view.encoding.axis.face.y;
        yFace = yFace === 'front' ? rangesMax.z : 0;
        let zFace = ((_view$encoding$channe9 = view.encoding[channel]) === null || _view$encoding$channe9 === void 0 ? void 0 : (_view$encoding$channe10 = _view$encoding$channe9.axis) === null || _view$encoding$channe10 === void 0 ? void 0 : _view$encoding$channe10.face) || defaults.view.encoding.axis.face.z;
        zFace = zFace === 'left' ? 0 : rangesMax.x;

        switch (channel) {
          case 'x':
            axes.push( /*#__PURE__*/React.createElement(XAxis, {
              key: "xAxis",
              fieldType: view.encoding[channel].type,
              numberFormat: view.encoding[channel].numberFormat,
              tickValues: tickValues,
              tickOffset: tickOffset,
              scales: scales,
              rangesMax: rangesMax,
              color: options.chartColor,
              title: title,
              titlePadding: (_view$encoding$channe11 = view.encoding[channel]) === null || _view$encoding$channe11 === void 0 ? void 0 : (_view$encoding$channe12 = _view$encoding$channe11.axis) === null || _view$encoding$channe12 === void 0 ? void 0 : _view$encoding$channe12.titlePadding,
              labels: (_view$encoding$channe13 = view.encoding[channel]) === null || _view$encoding$channe13 === void 0 ? void 0 : (_view$encoding$channe14 = _view$encoding$channe13.axis) === null || _view$encoding$channe14 === void 0 ? void 0 : _view$encoding$channe14.labels,
              ticks: (_view$encoding$channe15 = view.encoding[channel]) === null || _view$encoding$channe15 === void 0 ? void 0 : (_view$encoding$channe16 = _view$encoding$channe15.axis) === null || _view$encoding$channe16 === void 0 ? void 0 : _view$encoding$channe16.ticks,
              position: `0 0 ${xFace}`
            }));
            break;

          case 'y':
            axes.push( /*#__PURE__*/React.createElement(YAxis, {
              key: "yAxis",
              fieldType: view.encoding[channel].type,
              numberFormat: view.encoding[channel].numberFormat,
              tickValues: tickValues,
              tickOffset: tickOffset,
              scales: scales,
              rangesMax: rangesMax,
              color: options.chartColor,
              title: title,
              titlePadding: (_view$encoding$channe17 = view.encoding[channel]) === null || _view$encoding$channe17 === void 0 ? void 0 : (_view$encoding$channe18 = _view$encoding$channe17.axis) === null || _view$encoding$channe18 === void 0 ? void 0 : _view$encoding$channe18.titlePadding,
              labels: (_view$encoding$channe19 = view.encoding[channel]) === null || _view$encoding$channe19 === void 0 ? void 0 : (_view$encoding$channe20 = _view$encoding$channe19.axis) === null || _view$encoding$channe20 === void 0 ? void 0 : _view$encoding$channe20.labels,
              ticks: (_view$encoding$channe21 = view.encoding[channel]) === null || _view$encoding$channe21 === void 0 ? void 0 : (_view$encoding$channe22 = _view$encoding$channe21.axis) === null || _view$encoding$channe22 === void 0 ? void 0 : _view$encoding$channe22.ticks,
              position: `0 0 ${yFace}`
            }));
            break;

          case 'z':
            axes.push( /*#__PURE__*/React.createElement(ZAxis, {
              key: "zAxis",
              fieldType: view.encoding[channel].type,
              numberFormat: view.encoding[channel].numberFormat,
              tickValues: tickValues,
              tickOffset: tickOffset,
              scales: scales,
              rangesMax: rangesMax,
              color: options.chartColor,
              title: title,
              titlePadding: (_view$encoding$channe23 = view.encoding[channel]) === null || _view$encoding$channe23 === void 0 ? void 0 : (_view$encoding$channe24 = _view$encoding$channe23.axis) === null || _view$encoding$channe24 === void 0 ? void 0 : _view$encoding$channe24.titlePadding,
              labels: (_view$encoding$channe25 = view.encoding[channel]) === null || _view$encoding$channe25 === void 0 ? void 0 : (_view$encoding$channe26 = _view$encoding$channe25.axis) === null || _view$encoding$channe26 === void 0 ? void 0 : _view$encoding$channe26.labels,
              ticks: (_view$encoding$channe27 = view.encoding[channel]) === null || _view$encoding$channe27 === void 0 ? void 0 : (_view$encoding$channe28 = _view$encoding$channe27.axis) === null || _view$encoding$channe28 === void 0 ? void 0 : _view$encoding$channe28.ticks,
              position: `${zFace} 0 0`
            }));
            break;
        }
      }
    });
    return axes;
  };

  return /*#__PURE__*/React.createElement(Entity, null, generateTitle(), generateAxes());
};

Axes.propTypes = {
  view: PropTypes.object.isRequired,
  options: PropTypes.object.isRequired,
  scales: PropTypes.object.isRequired,
  rangesMax: PropTypes.object.isRequired
};
var Axes$1 = React.memo(Axes, (prev, next) => prev.view === next.view);

const AxisFilters = props => {
  var _view$encoding$x, _view$encoding$x$axis, _view$encoding$y, _view$encoding$y$axis, _view$encoding$z, _view$encoding$z$axis, _view$encoding$x3, _view$encoding$x3$axi, _view$encoding$y3, _view$encoding$y3$axi, _view$encoding$z3, _view$encoding$z3$axi;

  log.debug('Axis Filters Rendering');
  const dispatch = useContext(DispatchContext);
  const opacity = 1;
  const {
    view,
    options,
    dataset,
    scales,
    domainMap,
    rangesMax
  } = props;
  let xFace;
  let yFace;
  let zFace;

  if (((_view$encoding$x = view.encoding.x) === null || _view$encoding$x === void 0 ? void 0 : (_view$encoding$x$axis = _view$encoding$x.axis) === null || _view$encoding$x$axis === void 0 ? void 0 : _view$encoding$x$axis.filter) === true) {
    var _view$encoding$x2, _view$encoding$x2$axi;

    xFace = ((_view$encoding$x2 = view.encoding.x) === null || _view$encoding$x2 === void 0 ? void 0 : (_view$encoding$x2$axi = _view$encoding$x2.axis) === null || _view$encoding$x2$axi === void 0 ? void 0 : _view$encoding$x2$axi.face) || defaults.view.encoding.axis.face.x;
    xFace = xFace === 'front' ? 0 : -rangesMax.z;
  }

  if (((_view$encoding$y = view.encoding.y) === null || _view$encoding$y === void 0 ? void 0 : (_view$encoding$y$axis = _view$encoding$y.axis) === null || _view$encoding$y$axis === void 0 ? void 0 : _view$encoding$y$axis.filter) === true) {
    var _view$encoding$y2, _view$encoding$y2$axi;

    yFace = ((_view$encoding$y2 = view.encoding.y) === null || _view$encoding$y2 === void 0 ? void 0 : (_view$encoding$y2$axi = _view$encoding$y2.axis) === null || _view$encoding$y2$axi === void 0 ? void 0 : _view$encoding$y2$axi.face) || defaults.view.encoding.axis.face.y;
    yFace = yFace === 'front' ? rangesMax.z : 0;
  }

  if (((_view$encoding$z = view.encoding.z) === null || _view$encoding$z === void 0 ? void 0 : (_view$encoding$z$axis = _view$encoding$z.axis) === null || _view$encoding$z$axis === void 0 ? void 0 : _view$encoding$z$axis.filter) === true) {
    var _view$encoding$z2, _view$encoding$z2$axi;

    zFace = ((_view$encoding$z2 = view.encoding.z) === null || _view$encoding$z2 === void 0 ? void 0 : (_view$encoding$z2$axi = _view$encoding$z2.axis) === null || _view$encoding$z2$axi === void 0 ? void 0 : _view$encoding$z2$axi.face) || defaults.view.encoding.axis.face.z;
    zFace = zFace === 'left' ? 0 : rangesMax.x;
  }

  let faces = {
    xFace,
    yFace,
    zFace
  };

  const XFilter = (view, scales, opacity, domainMap, faces) => /*#__PURE__*/React.createElement(Entity, {
    position: `0 0 ${faces.xFace}`
  }, /*#__PURE__*/React.createElement(Entity, {
    class: "interactive",
    grabbable: {
      suppressY: true,
      suppressZ: true
    },
    events: {
      'grab-end': e => {
        dispatch({
          type: actionTypes.FILTER_DATA,
          payload: {
            value: scales.x.invert(e.detail.target.getAttribute('position').x),
            field: view.encoding.x.field,
            bound: 0,
            type: 'axis'
          }
        });
      }
    },
    opacity: opacity,
    primitive: "a-cone",
    "radius-top": "0.0",
    "radius-bottom": "0.01",
    height: "0.03",
    color: "#FFA493",
    position: `${scales.x(domainMap.get(view.encoding.x.field)[0])} -0.015 ${scales.z ? scales.z.range()[1] : 0}`,
    rotation: "0 0 0"
  }), /*#__PURE__*/React.createElement(Entity, {
    class: "interactive",
    grabbable: {
      suppressY: true,
      suppressZ: true
    },
    events: {
      'grab-end': e => {
        dispatch({
          type: actionTypes.FILTER_DATA,
          payload: {
            value: scales.x.invert(e.detail.target.getAttribute('position').x),
            field: view.encoding.x.field,
            bound: 1,
            type: 'axis'
          }
        });
      }
    },
    opacity: opacity,
    primitive: "a-cone",
    "radius-top": "0.0",
    "radius-bottom": "0.01",
    height: "0.03",
    color: "#FFA493",
    position: `${scales.x(domainMap.get(view.encoding.x.field)[1])} -0.015 ${scales.z ? scales.z.range()[1] : 0}`,
    rotation: "0 0 0"
  }));

  const YFilter = (view, scales, opacity, domainMap, faces) => /*#__PURE__*/React.createElement(Entity, {
    position: `0 0 ${faces.yFace}`
  }, /*#__PURE__*/React.createElement(Entity, {
    class: "interactive",
    grabbable: {
      suppressX: true,
      suppressZ: true
    },
    events: {
      'grab-end': e => {
        dispatch({
          type: actionTypes.FILTER_DATA,
          payload: {
            value: scales.y.invert(e.detail.target.getAttribute('position').y),
            field: view.encoding.y.field,
            bound: 0,
            type: 'axis'
          }
        });
      }
    },
    opacity: opacity,
    primitive: "a-cone",
    "radius-top": "0.0",
    "radius-bottom": "0.01",
    height: "0.03",
    color: "#98FF97",
    position: `-0.015 ${scales.y(domainMap.get(view.encoding.y.field)[0])} ${scales.z ? scales.z.range()[0] : 0}`,
    rotation: "0 0 -90"
  }), /*#__PURE__*/React.createElement(Entity, {
    class: "interactive",
    grabbable: {
      suppressX: true,
      suppressZ: true
    },
    events: {
      'grab-end': e => {
        dispatch({
          type: actionTypes.FILTER_DATA,
          payload: {
            value: scales.y.invert(e.detail.target.getAttribute('position').y),
            field: view.encoding.y.field,
            bound: 1,
            type: 'axis'
          }
        });
      }
    },
    opacity: opacity,
    primitive: "a-cone",
    "radius-top": "0.0",
    "radius-bottom": "0.01",
    height: "0.03",
    color: "#98FF97",
    position: `-0.015 ${scales.y(domainMap.get(view.encoding.y.field)[1])} ${scales.z ? scales.z.range()[0] : 0}`,
    rotation: "0 0 -90"
  }));

  const ZFilter = (view, scales, opacity, domainMap, faces) => /*#__PURE__*/React.createElement(Entity, {
    position: `${faces.zFace} 0 0`
  }, /*#__PURE__*/React.createElement(Entity, {
    class: "interactive",
    grabbable: {
      suppressX: true,
      suppressY: true
    },
    events: {
      'grab-end': e => {
        dispatch({
          type: actionTypes.FILTER_DATA,
          payload: {
            value: scales.z.invert(e.detail.target.getAttribute('position').z),
            field: view.encoding.z.field,
            bound: 0,
            type: 'axis'
          }
        });
      }
    },
    opacity: opacity,
    primitive: "a-cone",
    "radius-top": "0.0",
    "radius-bottom": "0.01",
    height: "0.03",
    color: "#86D7F5",
    position: `-0.015 0 ${scales.z(domainMap.get(view.encoding.z.field)[0])}`,
    rotation: "0 0 -90"
  }), /*#__PURE__*/React.createElement(Entity, {
    class: "interactive",
    grabbable: {
      suppressX: true,
      suppressY: true
    },
    events: {
      'grab-end': e => {
        dispatch({
          type: actionTypes.FILTER_DATA,
          payload: {
            value: scales.z.invert(e.detail.target.getAttribute('position').z),
            field: view.encoding.z.field,
            bound: 1,
            type: 'axis'
          }
        });
      }
    },
    opacity: opacity,
    primitive: "a-cone",
    "radius-top": "0.0",
    "radius-bottom": "0.01",
    height: "0.03",
    color: "#86D7F5",
    position: `-0.015 0 ${scales.z(domainMap.get(view.encoding.z.field)[1])}`,
    rotation: "0 0 -90"
  }));

  const mutualProps = [view, scales, opacity, domainMap, faces];
  return /*#__PURE__*/React.createElement(Entity, null, ((_view$encoding$x3 = view.encoding.x) === null || _view$encoding$x3 === void 0 ? void 0 : (_view$encoding$x3$axi = _view$encoding$x3.axis) === null || _view$encoding$x3$axi === void 0 ? void 0 : _view$encoding$x3$axi.filter) === true ? XFilter(...mutualProps) : null, ((_view$encoding$y3 = view.encoding.y) === null || _view$encoding$y3 === void 0 ? void 0 : (_view$encoding$y3$axi = _view$encoding$y3.axis) === null || _view$encoding$y3$axi === void 0 ? void 0 : _view$encoding$y3$axi.filter) === true ? YFilter(...mutualProps) : null, ((_view$encoding$z3 = view.encoding.z) === null || _view$encoding$z3 === void 0 ? void 0 : (_view$encoding$z3$axi = _view$encoding$z3.axis) === null || _view$encoding$z3$axi === void 0 ? void 0 : _view$encoding$z3$axi.filter) === true ? ZFilter(...mutualProps) : null);
};

AxisFilters.propTypes = {
  view: PropTypes.object.isRequired,
  options: PropTypes.object.isRequired,
  dataset: PropTypes.array.isRequired,
  scales: PropTypes.object.isRequired,
  domainMap: PropTypes.object.isRequired
};
var AxisFilters$1 = React.memo(AxisFilters, (prev, next) => prev.domainMap === next.domainMap);

const Marks = props => {
  log.debug('Marks Rendering');
  const {
    view,
    dataset,
    scales,
    customMarks
  } = props;
  const dispatch = useContext(DispatchContext);
  const markType = view.mark.type;
  const markShape = view.mark.shape;
  const marks = dataset.map((row, i) => {
    const vriaid = `vria-${row.vriaid}`;
    let tooltipContent = '';
    let tooltipHeight = 0.05;
    const lineHeight = 0.021;

    if (view.mark.tooltip !== false && view.mark.tooltip !== undefined) {
      if (view.mark.tooltip.content === 'data') {
        Object.keys(row).forEach(el => {
          if (el !== 'vriaid') {
            tooltipContent += `${el}: ${row[el]}\n`;
          }
        });
        tooltipHeight = Object.keys(row).length * lineHeight;
      } else if (view.mark.tooltip.content === 'encoding') {
        const fields = new Set();
        Object.keys(view.encoding).forEach(channel => {
          if (view.encoding[channel].field) fields.add(view.encoding[channel].field);
        });
        Object.keys(row).forEach(el => {
          if (el !== 'vriaid' && fields.has(el)) {
            tooltipContent += `${el}: ${row[el]}\n`;
          }
        });
        tooltipHeight = (fields.size + 1) * lineHeight;
      } else if (Array.isArray(view.mark.tooltip.content)) {
        Object.keys(row).forEach(el => {
          if (el !== 'vriaid' && view.mark.tooltip.content.includes(el)) {
            tooltipContent += `${el}: ${row[el]}\n`;
          }
        });
        tooltipHeight = (view.mark.tooltip.content.length + 1) * lineHeight;
      } else {
        tooltipContent = `${view.mark.tooltip.content}: ${row[view.mark.tooltip.content]}`;
      }
    }

    const markEvents = {
      mouseenter: e => {
        e.target.setAttribute('opacity', 0.5);

        if (view.mark.tooltip !== false && view.mark.tooltip !== undefined) {
          const tooltip = e.detail.cursorEl.parentEl.querySelector('.tooltip');
          tooltip.setAttribute('height', e.target.getAttribute('tooltipHeight'));
          tooltip.setAttribute('visible', true);
          tooltip.setAttribute('text', { ...tooltip.getAttribute('text'),
            value: e.target.getAttribute('tooltipContent')
          });
        }
      },
      mouseleave: e => {
        e.target.setAttribute('opacity', e.target.getAttribute('initialOpacity') || 0);

        if (view.mark.tooltip !== false && view.mark.tooltip !== undefined) {
          if (document.querySelectorAll('[vria-only-selected-mark]').length !== 0) {
            document.querySelectorAll('.tooltip').forEach(el => {
              el.setAttribute('text', {
                value: document.querySelector('[selected]').getAttribute('tooltipContent')
              });
            });
          } else {
            const tooltip = e.detail.cursorEl.parentEl.querySelector('.tooltip');
            tooltip.setAttribute('visible', false);
          }
        }

        if (e.target.getAttribute('selected') && e.target.getAttribute('wireframe')) {
          e.target.setAttribute('opacity', 1);
        }
      },
      click: e => {
        if (e.detail !== 0) {
          const showTooltip = view.mark.tooltip !== false && view.mark.tooltip !== undefined;
          dispatch({
            type: actionTypes.MARK_SELECTED,
            payload: {
              id: row.vriaid,
              vriaid,
              cursor: showTooltip ? e.detail.cursorEl.parentEl.querySelector('.tooltip') : null,
              tooltipHeight: showTooltip ? e.target.getAttribute('tooltipHeight') : null,
              tooltipContent: showTooltip ? e.target.getAttribute('tooltipContent') : null
            }
          });
        }
      }
    };
    let mark;
    const attributes = {};
    Object.keys(view.encoding).forEach(channel => {
      const field = view.encoding[channel].field;
      const scale = scales[channel];
      attributes[channel] = scale(row[field]);
    });
    if (attributes.opacity === undefined) attributes.opacity = 1;
    if (attributes.color === undefined) attributes.color = schemeCategory10[0];

    switch (markType) {
      case 'point':
        {
          attributes.size = attributes.size || defaults.view.mark.point.size;
          const radius = attributes.size;
          attributes.width = attributes.width || attributes.size;
          attributes.height = attributes.height || attributes.size;
          attributes.depth = attributes.depth || attributes.size;

          if (typeof attributes.xoffset === 'string') {
            switch (attributes.xoffset) {
              case 'half':
                {
                  attributes.x = attributes.x / 2;
                }
            }
          } else if (attributes.xoffset !== undefined) {
            attributes.x += attributes.xoffset;
          }

          if (typeof attributes.yoffset === 'string') {
            switch (attributes.yoffset) {
              case 'half':
                {
                  attributes.y = attributes.y / 2;
                }
            }
          } else if (attributes.yoffset !== undefined) {
            attributes.y += attributes.yoffset;
          }

          if (attributes.z && typeof attributes.zoffset === 'string') {
            switch (attributes.zoffset) {
              case 'half':
                {
                  attributes.z = attributes.z / 2;
                }
            }
          } else if (attributes.zoffset !== undefined) {
            attributes.z += attributes.zoffset;
          }

          attributes.position = `${attributes.x || 0} ${attributes.y || 0} ${attributes.z || 0}`;
          attributes.rotation = `${attributes.xrotation || 0} ${attributes.yrotation || 0} ${attributes.zrotation || 0}`;
          const shapeScaleMark = attributes.shape ? attributes.shape : null;

          switch (shapeScaleMark || markShape) {
            case 'sphere':
              mark = /*#__PURE__*/React.createElement(Entity, {
                key: i,
                tooltipContent: tooltipContent,
                tooltipHeight: tooltipHeight,
                primitive: "a-sphere",
                className: `interactive vria-mark ${vriaid}`,
                "data-mark": JSON.stringify(row),
                radius: radius,
                "segments-height": "9",
                "segments-width": "18",
                color: attributes.color,
                initialColor: attributes.color,
                position: attributes.position,
                rotation: attributes.rotation,
                initialOpacity: attributes.opacity,
                opacity: attributes.opacity,
                events: markEvents
              });
              break;

            case 'box':
              mark = /*#__PURE__*/React.createElement(Entity, {
                key: i,
                tooltipContent: tooltipContent,
                tooltipHeight: tooltipHeight,
                primitive: "a-box",
                className: `interactive vria-mark ${vriaid}`,
                "data-mark": JSON.stringify(row),
                width: attributes.width || radius,
                height: attributes.height || radius,
                depth: attributes.depth || radius,
                color: attributes.color,
                initialColor: attributes.color,
                position: attributes.position,
                rotation: attributes.rotation,
                initialOpacity: attributes.opacity,
                opacity: attributes.opacity,
                events: markEvents
              });
              break;

            case 'cone':
              mark = /*#__PURE__*/React.createElement(Entity, {
                key: i,
                tooltipContent: tooltipContent,
                tooltipHeight: tooltipHeight,
                primitive: "a-cone",
                className: `interactive vria-mark ${vriaid}`,
                "data-mark": JSON.stringify(row),
                height: attributes.length || attributes.height || radius * 2,
                color: attributes.color,
                initialColor: attributes.color,
                position: attributes.position,
                rotation: attributes.rotation,
                "segments-height": "9",
                "segments-radial": "18",
                "radius-top": "0",
                "radius-bottom": radius,
                initialOpacity: attributes.opacity,
                opacity: attributes.opacity,
                events: markEvents
              });
              break;

            case 'tetrahedron':
              mark = /*#__PURE__*/React.createElement(Entity, {
                key: i,
                tooltipContent: tooltipContent,
                tooltipHeight: tooltipHeight,
                primitive: "a-tetrahedron",
                className: `interactive vria-mark ${vriaid}`,
                "data-mark": JSON.stringify(row),
                radius: radius,
                color: attributes.color,
                initialColor: attributes.color,
                position: attributes.position,
                rotation: attributes.rotation,
                initialOpacity: attributes.opacity,
                opacity: attributes.opacity,
                events: markEvents
              });
              break;

            case 'torus':
              mark = /*#__PURE__*/React.createElement(Entity, {
                key: i,
                tooltipContent: tooltipContent,
                tooltipHeight: tooltipHeight,
                primitive: "a-torus",
                className: `interactive vria-mark ${vriaid}`,
                "data-mark": JSON.stringify(row),
                radius: radius,
                color: attributes.color,
                initialColor: attributes.color,
                position: attributes.position,
                rotation: attributes.rotation,
                initialOpacity: attributes.opacity,
                opacity: attributes.opacity,
                events: markEvents
              });
              break;

            case 'cylinder':
              mark = /*#__PURE__*/React.createElement(Entity, {
                key: i,
                tooltipContent: tooltipContent,
                tooltipHeight: tooltipHeight,
                primitive: "a-cylinder",
                className: `interactive vria-mark ${vriaid}`,
                "data-mark": JSON.stringify(row),
                rotation: attributes.rotation,
                radius: attributes.width / 2 || 0.05,
                height: attributes.depth !== 0 ? attributes.depth : 0.001,
                color: attributes.color,
                initialColor: attributes.color,
                position: attributes.position,
                initialOpacity: attributes.opacity,
                opacity: attributes.opacity,
                events: markEvents
              });
              break;

            default:
              {
                const data = JSON.stringify(row);
                const key = i;
                const className = `interactive vria-mark ${vriaid}`;
                mark = /*#__PURE__*/React.createElement(Entity, {
                  tooltipContent: tooltipContent,
                  tooltipHeight: tooltipHeight,
                  wireframe: true,
                  color: "white",
                  initialColor: "white",
                  primitive: "a-box",
                  opacity: "0",
                  key: key,
                  className: className,
                  "data-mark": data,
                  width: attributes.size,
                  height: attributes.size,
                  depth: attributes.size,
                  rotation: attributes.rotation,
                  position: attributes.position,
                  events: markEvents
                }, customMarks[markShape]({ ...attributes,
                  scales,
                  data
                }));
                break;
              }
          }

          break;
        }

      case 'bar':
        {
          var _view$encoding, _view$encoding$x, _view$encoding2, _view$encoding2$y, _view$encoding3, _view$encoding3$z;

          const fTypes = {
            x: ((_view$encoding = view.encoding) === null || _view$encoding === void 0 ? void 0 : (_view$encoding$x = _view$encoding.x) === null || _view$encoding$x === void 0 ? void 0 : _view$encoding$x.type) || null,
            y: ((_view$encoding2 = view.encoding) === null || _view$encoding2 === void 0 ? void 0 : (_view$encoding2$y = _view$encoding2.y) === null || _view$encoding2$y === void 0 ? void 0 : _view$encoding2$y.type) || null,
            z: ((_view$encoding3 = view.encoding) === null || _view$encoding3 === void 0 ? void 0 : (_view$encoding3$z = _view$encoding3.z) === null || _view$encoding3$z === void 0 ? void 0 : _view$encoding3$z.type) || null
          };
          const q = [];
          const n = [];
          Object.keys(fTypes).forEach(f => {
            if (fTypes[f] === 'quantitative') {
              q.push(f);
            } else if (fTypes[f] === null) {
              n.push(f);
            }
          });

          if (q.length === 1) {
            if (n.length === 2) {
              log.error('Chart type "bar" expects 2 axis encoding channels (x, y and/or z)');
            }
          } else {
            log.error('Chart type "bar" expects exactly one quantitative data field');
          }

          const quantField = q[0];

          if (!scales.width && !scales.height && !scales.depth) {
            let xPos = 0;
            let yPos = 0;
            let zPos = 0;
            let width = 0;
            let height = 0;
            let depth = 0;

            switch (quantField) {
              case 'x':
                xPos = scales.x ? attributes.x / 2 : 0.001;
                yPos = scales.y ? attributes.y + scales.y.bandwidth() / 2 : 0.001;
                zPos = scales.z ? attributes.z + scales.z.bandwidth() / 2 || 0 : -0.001;
                width = attributes.x || 0.001;
                height = scales.y ? scales.y.bandwidth() : 0.001;
                depth = scales.z ? scales.z.bandwidth() : 0.0001;
                break;

              case 'y':
                xPos = scales.x ? attributes.x + scales.x.bandwidth() / 2 : 0.001;
                yPos = scales.y ? attributes.y / 2 : 0.001;
                zPos = scales.z ? attributes.z + scales.z.bandwidth() / 2 || 0 : -0.001;
                width = scales.x ? scales.x.bandwidth() : 0.001;
                height = attributes.y || 0.001;
                depth = scales.z ? scales.z.bandwidth() : 0.001;
                break;

              case 'z':
                xPos = scales.x ? attributes.x + scales.x.bandwidth() / 2 : 0.001;
                yPos = scales.y ? attributes.y + scales.y.bandwidth() / 2 || 0 : 0.001;
                zPos = scales.z ? attributes.z / 2 : -0.001;
                width = scales.x ? scales.x.bandwidth() : 0.001;
                height = scales.y ? scales.y.bandwidth() : 0.001;
                depth = attributes.z || 0.001;
                break;
            }

            attributes.position = `${xPos} ${yPos} ${zPos}`;

            switch (markShape) {
              case 'box':
                mark = /*#__PURE__*/React.createElement(Entity, {
                  key: i,
                  tooltipContent: tooltipContent,
                  tooltipHeight: tooltipHeight,
                  position: attributes.position,
                  primitive: "a-box",
                  className: `interactive vria-mark ${vriaid}`,
                  "data-mark": JSON.stringify(row),
                  width: width,
                  height: height,
                  depth: depth,
                  color: attributes.color,
                  initialColor: attributes.color,
                  initialOpacity: attributes.opacity,
                  opacity: attributes.opacity,
                  events: markEvents
                });
                break;

              case 'plane':
                break;

              case 'cylinder':
                mark = /*#__PURE__*/React.createElement(Entity, {
                  key: i,
                  tooltipContent: tooltipContent,
                  tooltipHeight: tooltipHeight,
                  primitive: "a-cylinder",
                  className: `interactive vria-mark ${vriaid}`,
                  "data-mark": JSON.stringify(row),
                  rotation: "0 0 0",
                  radius: width / 2,
                  height: height,
                  color: attributes.color,
                  initialColor: attributes.color,
                  position: attributes.position,
                  initialOpacity: attributes.opacity,
                  opacity: attributes.opacity,
                  events: markEvents
                });
                break;

              case 'cone':
                mark = /*#__PURE__*/React.createElement(Entity, {
                  key: i,
                  tooltipContent: tooltipContent,
                  tooltipHeight: tooltipHeight,
                  primitive: "a-cone",
                  className: `interactive vria-mark ${vriaid}`,
                  "data-mark": JSON.stringify(row),
                  height: height,
                  color: attributes.color,
                  initialColor: attributes.color,
                  position: attributes.position,
                  rotation: attributes.rotation,
                  "segments-height": "9",
                  "segments-radial": "18",
                  "radius-top": "0",
                  "radius-bottom": min([scales.x.bandwidth() / 2, scales.z.bandwidth() / 2]),
                  initialOpacity: attributes.opacity,
                  opacity: attributes.opacity,
                  events: markEvents
                });
                break;

              default:
                {
                  const data = JSON.stringify(row);
                  const key = i;
                  const className = `interactive vria-mark ${vriaid}`;
                  console.log('custommarks', customMarks);
                  mark = /*#__PURE__*/React.createElement(Entity, {
                    tooltipContent: tooltipContent,
                    tooltipHeight: tooltipHeight,
                    wireframe: true,
                    color: "white",
                    initialColor: "white",
                    primitive: "a-box",
                    opacity: "0",
                    key: key,
                    className: className,
                    width: width,
                    height: height,
                    depth: depth,
                    rotation: attributes.rotation,
                    position: attributes.position,
                    events: markEvents
                  }, customMarks[markShape]({ ...attributes,
                    scales,
                    data,
                    width,
                    height,
                    depth
                  }));
                  break;
                }
            }
          }

          break;
        }
    }

    return mark;
  });
  return /*#__PURE__*/React.createElement(Entity, {
    className: "marks"
  }, marks);
};

Marks.propTypes = {
  view: PropTypes.object.isRequired,
  customMarks: PropTypes.object,
  dataset: PropTypes.array.isRequired,
  scales: PropTypes.object.isRequired
};
var Marks$1 = React.memo(Marks, (prevProps, nextProps) => {
  return isEqual(prevProps.view, nextProps.view) && isEqual(prevProps.parsedDataset, nextProps.parsedDataset);
});

const View = props => {
  const {
    view,
    scales,
    index
  } = props;
  const position = `${view.x} ${view.y + defaults.options.userHeight} ${view.z}`;
  const rotation = `${view.xrotation} ${view.yrotation} ${view.zrotation}`;
  const {
    width,
    height,
    depth
  } = view;
  const rangesMax = {
    x: scales.x ? scales.x.range()[1] : 0,
    y: scales.y ? scales.y.range()[1] : 0,
    z: scales.z ? scales.z.range()[1] : 0
  };
  const legends = Object.keys(view.encoding).filter(c => view.encoding[c].legend).map((channel, i) => /*#__PURE__*/React.createElement(Legend$1, Object.assign({
    key: `v${index}l${i}${channel}`
  }, props, {
    index: i,
    channel: channel,
    rangesMax: rangesMax
  })));
  const markProps = {
    view: props.view,
    customMarks: props.customMarks,
    dataset: props.dataset,
    parsedDataset: props.parsedDataset,
    scales: props.scales,
    options: props.options
  };
  return /*#__PURE__*/React.createElement(Entity, {
    className: `vria-view-${index}`,
    position: position,
    rotation: rotation,
    width: width,
    height: height,
    depth: depth
  }, legends, /*#__PURE__*/React.createElement(Axes$1, Object.assign({}, props, {
    rangesMax: rangesMax
  })), /*#__PURE__*/React.createElement(AxisFilters$1, Object.assign({}, props, {
    rangesMax: rangesMax
  })), /*#__PURE__*/React.createElement(Marks$1, markProps));
};

View.propTypes = {
  view: PropTypes.object.isRequired,
  options: PropTypes.object.isRequired,
  dataset: PropTypes.array.isRequired,
  parsedDataset: PropTypes.array.isRequired,
  scales: PropTypes.object.isRequired,
  domainMap: PropTypes.object.isRequired
};

const Camera = props => {
  const standardCamera = /*#__PURE__*/React.createElement(Entity, {
    primitive: "a-camera",
    "wasd-controls-enabled": true,
    position: "0 1.6 0",
    "capture-mouse": true,
    raycaster: "objects: .interactive; far: 5",
    cursor: "rayOrigin: mouse",
    "super-hands": {
      colliderEvent: 'raycaster-intersection',
      colliderEventProperty: 'els',
      colliderEndEvent: 'raycaster-intersection-cleared',
      colliderEndEventProperty: 'clearedEls'
    }
  }, /*#__PURE__*/React.createElement(Entity, {
    primitive: "a-plane",
    id: "tooltip",
    className: "tooltip",
    visible: "false",
    position: "0 -0.15 -0.4",
    color: "#333",
    opacity: "0.8",
    width: "auto",
    height: "auto",
    text: {
      value: 'Tooltip',
      color: '#FFF',
      xOffset: -0.18,
      anchor: 'left',
      align: 'left',
      lineHeight: 50,
      width: 0.4
    }
  }));
  const vrCamera = /*#__PURE__*/React.createElement(Entity, {
    primitive: "a-camera",
    "wasd-controls-enabled": true,
    position: "0 1.6 0",
    "capture-mouse": true,
    raycaster: "objects: .interactive; far: 5",
    cursor: "rayOrigin: mouse",
    "super-hands": {
      colliderEvent: 'raycaster-intersection',
      colliderEventProperty: 'els',
      colliderEndEvent: 'raycaster-intersection-cleared',
      colliderEndEventProperty: 'clearedEls'
    }
  });
  const mobileCamera = /*#__PURE__*/React.createElement(Entity, {
    primitive: "a-camera",
    "wasd-controls-enabled": true,
    position: "0 1.6 0",
    "capture-mouse": true
  }, /*#__PURE__*/React.createElement(Entity, {
    cursor: {
      fuse: true,
      fuseTimeout: 1250
    },
    geometry: {
      primitive: 'ring',
      radiusInner: 0.01,
      radiusOuter: 0.015
    },
    material: {
      color: props.options.baseColor,
      shader: 'flat'
    },
    fuse: "true",
    fuseTimeout: "1250",
    position: "0 0 -0.6",
    raycaster: "objects: .interactive; far: 5;",
    "super-hands": {
      colliderEvent: 'raycaster-intersection',
      colliderEventProperty: 'els',
      colliderEndEvent: 'raycaster-intersection-cleared',
      colliderEndEventProperty: 'clearedEls'
    },
    animation__fusing: "property: scale; startEvents: fusing; easing: easeInCubic; dur: 1250; from: 1 1 1; to: 0.2 0.2 0.2",
    animation__click: "property: scale; startEvents: click; easing: easeInCubic; dur: 100; from: 0.2 0.2 0.2; to: 1 1 1",
    animation__mouseleave: "property: scale; startEvents: mouseleave; easing: easeInCubic; dur: 400; to: 1 1 1"
  }), /*#__PURE__*/React.createElement(Entity, {
    primitive: "a-plane",
    id: "tooltip",
    className: "tooltip tooltip-mobile",
    visible: "false",
    position: "0 -0.15 -0.4",
    color: "#333",
    opacity: "0.8",
    width: "auto",
    height: "auto",
    scale: "0.5 0.5 0.5",
    text: {
      value: 'Tooltip',
      color: '#FFF',
      xOffset: -0.18,
      anchor: 'left',
      align: 'left',
      lineHeight: 50,
      width: 0.4
    }
  }));
  let camera;

  if (AFRAME.utils.device.isMobile()) {
    camera = mobileCamera;
  } else if (AFRAME.utils.device.checkHeadsetConnected()) {
    camera = vrCamera;
  } else {
    camera = standardCamera;
  }

  return camera;
};

var Camera$1 = React.memo(Camera, (prev, next) => prev.options.baseColor === next.options.baseColor);

const Controllers = ({
  handedness
}) => {
  if (AFRAME.utils.device.checkHeadsetConnected() && !AFRAME.utils.device.isMobile() && handedness !== 'none') {
    return /*#__PURE__*/React.createElement(Fragment, null, handedness === 'both' || handedness === 'left' ? /*#__PURE__*/React.createElement(Entity, null, /*#__PURE__*/React.createElement(Entity, {
      "laser-controls": "hand: left;model: false",
      className: "controller controller-left",
      raycaster: "showLine: true; far: 2; objects: .interactive",
      "super-hands": {
        colliderEvent: 'raycaster-intersection',
        colliderEventProperty: 'els',
        colliderEndEvent: 'raycaster-intersection-cleared',
        colliderEndEventProperty: 'clearedEls'
      }
    }, /*#__PURE__*/React.createElement(Entity, {
      scale: "0.5 0.5 0.5",
      primitive: "a-plane",
      color: "#333",
      opacity: "0.8",
      width: "auto",
      height: "auto",
      text: {
        value: 'Tooltip',
        color: '#FFF',
        xOffset: -0.18,
        anchor: 'left',
        align: 'left',
        lineHeight: 50,
        width: 0.4
      },
      className: "tooltip tooltip-left",
      id: "tooltip",
      visible: "false",
      position: "0 0.05 -0.2",
      rotation: "-20 0 0"
    }), /*#__PURE__*/React.createElement(Entity, {
      primitive: "a-box",
      width: "0.01",
      height: "0.01",
      depth: "0.1",
      color: "#EF2D2D"
    }))) : null, handedness === 'both' || handedness === 'right' ? /*#__PURE__*/React.createElement(Entity, null, /*#__PURE__*/React.createElement(Entity, {
      "laser-controls": "hand: right; model: false",
      className: "controller controller-right",
      raycaster: "showLine: true; far: 2; objects: .interactive",
      "super-hands": {
        colliderEvent: 'raycaster-intersection',
        colliderEventProperty: 'els',
        colliderEndEvent: 'raycaster-intersection-cleared',
        colliderEndEventProperty: 'clearedEls'
      }
    }, /*#__PURE__*/React.createElement(Entity, {
      scale: "0.5 0.5 0.5",
      primitive: "a-plane",
      color: "#333",
      opacity: "0.8",
      width: "auto",
      height: "auto",
      text: {
        value: 'Tooltip',
        color: '#FFF',
        xOffset: -0.18,
        anchor: 'left',
        align: 'left',
        lineHeight: 50,
        width: 0.4
      },
      className: "tooltip tooltip-right",
      id: "tooltip",
      visible: "false",
      position: "0 0.05 -0.2",
      rotation: "-20 0 0"
    }), /*#__PURE__*/React.createElement(Entity, {
      primitive: "a-box",
      width: "0.01",
      height: "0.01",
      depth: "0.1",
      color: "#EF2D2D"
    }))) : null);
  } else {
    return null;
  }
};

const setSceneAttributes = el => {
  setTimeout(() => {
    el.sceneEl.setAttribute('touch-to-click-converter');
    const vrDisplayConnected = AFRAME.utils.device.checkHeadsetConnected();

    if (!vrDisplayConnected) {
      el.sceneEl.setAttribute('rayOrigin', 'mouse');
    }
  }, 0);
};

const VRIA = ({
  config,
  options,
  setSelection,
  onSelection,
  onConfigParsed,
  setFilters,
  onFilter,
  additionalFilters,
  customMarks,
  ...rest
}) => {
  const [state, dispatch] = useReducer(reducer, { ...initialState,
    onConfigParsed,
    onSelection,
    onFilter,
    additionalFilters,
    options: { ...defaults.options,
      ...options
    }
  });
  useEffect(() => {
    dispatch({
      type: actionTypes.SET_OPTIONS,
      payload: options
    });
  }, [options]);
  useEffect(() => {
    dispatch({
      type: actionTypes.SET_ADDITIONAL_FILTERS,
      payload: additionalFilters
    });
  }, [additionalFilters]);
  useEffect(() => {
    if (setSelection !== undefined && setSelection !== null && typeof setSelection === 'object') {
      dispatch({
        type: actionTypes.SET_SELECTION,
        payload: setSelection
      });
    }
  }, [setSelection]);
  useEffect(() => {
    if (setFilters !== undefined && setFilters !== null && typeof setFilters === 'object') {
      dispatch({
        type: actionTypes.SET_FILTERS,
        payload: setFilters
      });
    }
  }, [setFilters]);
  useEffect(() => {
    if (typeof state.onSelection === 'function') {
      state.onSelection(state.selection);
    }
  }, [state.selection]);
  useEffect(() => {
    if (typeof state.onFilter === 'function') {
      state.onFilter(state.domainMap);
    }
  }, [state.domainMap]);
  useEffect(() => {
    log.mode();
  }, []);
  useEffect(() => {
    try {
      compileVisConfig(config, additionalFilters).then(res => {
        if (typeof state.onConfigParsed === 'function') {
          state.onConfigParsed(res);
        }

        res.dataset = res.dataset.map((row, i) => {
          row.vriaid = i;
          return row;
        });
        dispatch({
          type: actionTypes.VIS_CONFIG_COMPILED,
          payload: res
        });
        log.debug('compiledConfig', res);
      });
    } catch (err) {
      log.error(err);
    }
  }, [config]);
  return /*#__PURE__*/React.createElement(DispatchContext.Provider, {
    value: dispatch
  }, /*#__PURE__*/React.createElement(Entity, rest, /*#__PURE__*/React.createElement(Entity, {
    _ref: setSceneAttributes
  }), /*#__PURE__*/React.createElement(Camera$1, {
    options: state.options
  }), /*#__PURE__*/React.createElement(Controllers, {
    handedness: state.options.handedness
  }), state.filteredDataset ? state.compiledConfig.views.map((view, i) => /*#__PURE__*/React.createElement(Entity, {
    key: `v${i}`,
    position: rest.position,
    rotation: rest.rotation
  }, /*#__PURE__*/React.createElement(View, {
    index: i,
    view: view,
    options: state.options,
    dataset: state.filteredDataset,
    parsedDataset: state.parsedDataset,
    scales: state.scales[i],
    domainMap: state.domainMap,
    selection: state.selection,
    customMarks: customMarks
  }))) : null));
};

VRIA.propTypes = {
  config: PropTypes.object.isRequired,
  options: PropTypes.object,
  setSelection: PropTypes.object,
  onSelection: PropTypes.func,
  onConfigParsed: PropTypes.func,
  setFilters: PropTypes.object,
  onFilter: PropTypes.func,
  additionalFilters: PropTypes.array,
  customMarks: PropTypes.object
};
var index = React.memo(VRIA);

export default index;
export { schema, validateVisConfig };
//# sourceMappingURL=vria.modern.js.map
