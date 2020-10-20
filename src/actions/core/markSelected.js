import cloneDeep from 'lodash/cloneDeep';

const markSelected = (state, payload) => {
  const selection = {
    dataMap: new Map(state.selection.dataMap),
    data: [],
    marks: []
  };

  const setMarkData = () => {
    // Remove vriaid and add to selection map
    const selectedRow = cloneDeep(
      state.filteredDataset.filter((el) => el.vriaid === payload.id)
    );
    delete selectedRow[0].vriaid;
    selection.dataMap.set(payload.vriaid, ...selectedRow);
  };

  if (state.selection.dataMap.has(payload.vriaid)) {
    // Update selection map if mark was deselected
    selection.dataMap.delete(payload.vriaid);
  } else if (
    state.options.multiSelect === true ||
    selection.dataMap.size === 0
  ) {
    setMarkData();
  } else if (
    state.options.multiSelect === false &&
    selection.dataMap.size === 1
  ) {
    // Switch selected to another mark
    selection.dataMap.delete(selection.dataMap.keys().next().value);
    setMarkData();
  }

  // Add raw data values to selection data array
  selection.data = [...selection.dataMap.values()];

  // Add mark classnames to marks array
  selection.marks = [...selection.dataMap.keys()];

  // Reset colour on all marks
  document.querySelectorAll('[selected]').forEach((el) => {
    el.setAttribute('color', el.getAttribute('initialColor'));
    el.removeAttribute('selected');
    el.removeAttribute('vria-only-selected-mark');
    if (el.getAttribute('wireframe')) {
      el.setAttribute('opacity', 0);
    }
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
        if (el.getAttribute('wireframe')) {
          el.setAttribute('opacity', 1);
        }
      });
    });
  }

  // Set tooltip if a single mark is selected
  if (selection.dataMap.size === 1) {
    if (payload.showTooltip !== null && payload.showTooltip !== undefined) {
      const tooltip = payload.cursor;
      tooltip.setAttribute('height', payload.tooltipHeight);
      tooltip.setAttribute('visible', true);
      tooltip.setAttribute('text', {
        ...tooltip.getAttribute('text'),
        value: payload.tooltipContent
      });
    }
  }

  return {
    ...state,
    selection
  };
};

export default markSelected;
