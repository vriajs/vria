import cloneDeep from 'lodash/cloneDeep';

const setSelection = (state, payload) => {
  const clearSelection = {
    dataMap: new Map(),
    data: [],
    marks: []
  };
  let selection;
  if (
    Object.hasOwnProperty.call(payload, 'dataMap') &&
    Object.hasOwnProperty.call(payload, 'data') &&
    Object.hasOwnProperty.call(payload, 'marks')
  ) {
    selection = cloneDeep(payload);
  } else {
    selection = clearSelection;
  }

  // Reset selection state and colour on all marks
  document.querySelectorAll('[selected]').forEach((el) => {
    el.setAttribute('color', el.getAttribute('initialColor'));
    el.removeAttribute('selected');
    el.removeAttribute('vria-only-selected-mark');
  });

  // Set selected colour on selected marks
  if (selection.dataMap.size !== 0) {
    selection.dataMap.forEach((value, key) => {
      document.querySelectorAll(`.${key}`).forEach((el) => {
        el.setAttribute('selected', true);
        el.setAttribute('color', state.options.selectColor);
        if (selection.dataMap.size === 1) {
          el.setAttribute('vria-only-selected-mark', true);
        }
      });
    });
  }

  return {
    ...state,
    selection
  };
};

export default setSelection;
