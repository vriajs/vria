/**
 * @name applyFilters
 * @description Applies domain filters to a dataset
 * @author Peter Butcher <pete@pbutcher.uk>
 * @param {object} dataset - Dataset to filter
 * @param {object} domainMap - All domains in this vis-config
 * @returns {object} Filtered dataset
 */
function applyFilters(dataset, domainMap) {
  const filteredDataset = [];

  const marks = document.querySelectorAll('.vria-mark');

  // Hide all marks
  marks.forEach((el) => {
    el.setAttribute('visible', false);
    el.classList.remove('interactive');
  });

  // Loop over every row in the dataset
  dataset.forEach((row) => {
    let filtersSatisfied = true;

    // For every field...
    Object.keys(row).forEach((field) => {
      // If a field has a filter associated with it...
      if (domainMap.has(field)) {
        // A domainMap domain is empty...
        if (domainMap.get(field).length === 0) {
          filtersSatisfied = false;
        } else if (typeof domainMap.get(field)[0] === 'string') {
          // For filters containing strings
          // If the value of this field isn't in the filter array...
          if (!domainMap.get(field).includes(row[field])) {
            // Discard this row
            filtersSatisfied = false;
          }
          // For filters containing numbers
        } else {
          if (
            row[field] < domainMap.get(field)[0] ||
            row[field] > domainMap.get(field)[1]
          ) {
            filtersSatisfied = false;
          }
        }
      }
    });

    if (filtersSatisfied) {
      filteredDataset.push(row);
      document.querySelectorAll(`.vria-${row.vriaid}`).forEach((el) => {
        el.setAttribute('visible', true);
        el.classList.add('interactive');
      });
    }
  });

  return filteredDataset;
}

export default applyFilters;
