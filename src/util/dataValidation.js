/**
 * Data validation utility for MSDAT Nigeria
 * Handles edge cases for data anomaly flagging
 */

export const EDGE_CASES = {
  PERCENTAGE_EXCEEDING_100: 'PERCENTAGE_EXCEEDING_100',
  NEGATIVE_VALUE: 'NEGATIVE_VALUE',
  NEGATIVE_PERCENTAGE: 'NEGATIVE_PERCENTAGE',
  NULL_OR_MISSING: 'NULL_OR_MISSING',
  ZERO_VALUE_ILLOGICAL: 'ZERO_VALUE_ILLOGICAL',
  IMPLAUSIBLE_VALUE: 'IMPLAUSIBLE_VALUE',
  DATA_TYPE_ERROR: 'DATA_TYPE_ERROR',
};

/**
 * Validates a single data value against defined edge cases
 * @param {any} value The value to validate
 * @param {Object} context Metadata about the indicator (e.g., is_percentage, indicator_type)
 * @returns {Array} List of flags/anomalies found
 */
export function validateDataValue(value, context = {}) {
  const flags = [];
  const {
    is_percentage: isPercentage,
    min_threshold: minThreshold,
    max_threshold: maxThreshold,
    is_financial: isFinancial,
    is_difference: isDifference,
    indicator_name: indicatorName,
  } = context;

  // 7. Data Type Errors
  if (value !== null && value !== undefined && typeof value !== 'number' && Number.isNaN(Number(value))) {
    flags.push({
      type: EDGE_CASES.DATA_TYPE_ERROR,
      message: 'Non-numeric data appearing in numeric field.',
    });
    return flags; // Return early for type errors
  }

  const numValue = Number(value);

  // 4. Null or Missing Values
  if (value === null || value === undefined || Number.isNaN(numValue) || value === '') {
    flags.push({
      type: EDGE_CASES.NULL_OR_MISSING,
      message: 'Value is missing or invalid.',
    });
    return flags;
  }

  // 1. Percentage Values Exceeding 100%
  if (isPercentage && numValue > 100) {
    flags.push({
      type: EDGE_CASES.PERCENTAGE_EXCEEDING_100,
      message: `Percentage value (${numValue}%) exceeds 100%.`,
    });
  }

  // 2. Negative Values
  if (numValue < 0 && !isFinancial && !isDifference) {
    flags.push({
      type: EDGE_CASES.NEGATIVE_VALUE,
      message: 'Negative value in a non-financial/non-difference metric.',
    });
  }

  // 3. Negative Percentages
  if (isPercentage && numValue < 0 && !isDifference) {
    flags.push({
      type: EDGE_CASES.NEGATIVE_PERCENTAGE,
      message: 'Negative percentage in a static indicator.',
    });
  }

  // 5. Zero Values Where Illogical
  // Example: 0 deaths or 0 health facilities might be suspicious if they were once positive
  // This usually needs more context, but we can flag it for specific indicators if needed
  if (numValue === 0) {
    // Basic check for common metrics that usually aren't 0
    const suspiciousIndicators = ['population', 'health facilities', 'schools'];
    if (indicatorName && suspiciousIndicators.some((term) => indicatorName.toLowerCase().includes(term))) {
      flags.push({
        type: EDGE_CASES.ZERO_VALUE_ILLOGICAL,
        message: 'Zero value might be a placeholder instead of true zero.',
      });
    }
  }

  // 6. Implausible or Outlier Values
  if (minThreshold !== undefined && numValue < minThreshold) {
    flags.push({
      type: EDGE_CASES.IMPLAUSIBLE_VALUE,
      message: `Value is below the realistic minimum threshold of ${minThreshold}.`,
    });
  }
  if (maxThreshold !== undefined && numValue > maxThreshold) {
    flags.push({
      type: EDGE_CASES.IMPLAUSIBLE_VALUE,
      message: `Value exceeds the realistic maximum threshold of ${maxThreshold}.`,
    });
  }

  return flags;
}

/**
 * Validates a dataset (array of data points)
 * @param {Array} data Array of objects containing values
 * @param {string} valueKey The key for the numeric value in the object
 * @param {Object} context Shared context for the dataset
 * @returns {Array} Array of flags for the entire dataset
 */
export function validateDataset(data, valueKey, context = {}) {
  if (!Array.isArray(data)) return [];

  const allFlags = [];
  data.forEach((item, index) => {
    const value = item[valueKey];
    const itemFlags = validateDataValue(value, context);
    if (itemFlags.length > 0) {
      allFlags.push({
        index,
        item,
        flags: itemFlags,
      });
    }
  });

  return allFlags;
}
