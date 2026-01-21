import React from "react";
import { getAttributesForCategory } from "../../utils/categoryAttributes";
import { HiCheckCircle, HiClipboardList, HiXCircle } from "react-icons/hi";

/**
 * DynamicSpecifications Component
 * Displays category-specific attributes in a clean, professional layout
 * Matches category names from database to configuration
 */
const DynamicSpecifications = ({ product }) => {
  const attributes = product?.attributes || {};

  // Get category name - handle both string and populated object
  const categoryName =
    typeof product?.categoryname === "string"
      ? product.categoryname
      : product?.categoryname?.name || product?.categoryname?.categoryname;

  // Get subcategory name
  const subcategoryName =
    typeof product?.subcategory === "string"
      ? product.subcategory
      : product?.subcategory?.name || product?.subcategory?.subcategory;

  // If no category, try subcategory
  const primaryCategory = categoryName || subcategoryName;

  if (!primaryCategory) {
    return (
      <div className="text-center py-8 text-gray-400">
        <HiClipboardList className="w-12 h-12 mx-auto mb-2 text-gray-300" />
        <p className="text-sm">No category information available</p>
      </div>
    );
  }

  // Try to get config from category first, then subcategory
  let categoryConfig = getAttributesForCategory(categoryName);

  // If category gives default config, try subcategory
  if ((!categoryConfig || categoryConfig.label === 'General Product') && subcategoryName) {
    const subConfig = getAttributesForCategory(subcategoryName);
    if (subConfig && subConfig.label !== 'General Product') {
      categoryConfig = subConfig;
    }
  }

  // If no config or no fields, show message
  if (!categoryConfig?.fields?.length) {
    return (
      <div className="text-center py-8 text-gray-400">
        <HiClipboardList className="w-12 h-12 mx-auto mb-2 text-gray-300" />
        <p className="text-sm">No additional specifications for this category</p>
        <p className="text-xs mt-1 text-gray-300">Category: {primaryCategory}</p>
      </div>
    );
  }

  // Filter fields that have values in product.attributes
  const visibleFields = categoryConfig.fields.filter(field => {
    const value = attributes[field.name];
    return value !== undefined && value !== null && value !== "" && value !== "undefined";
  });

  // If no visible fields but we have attributes in other locations, show a message
  if (!visibleFields.length) {
    // Check if there are any attributes at all
    const hasAnyAttributes = Object.keys(attributes).length > 0;

    return (
      <div className="text-center py-8 text-gray-400">
        <HiClipboardList className="w-12 h-12 mx-auto mb-2 text-gray-300" />
        <p className="text-sm">
          {hasAnyAttributes ? 'Displaying available specifications above' : 'No category-specific details available'}
        </p>
        <p className="text-xs mt-2 text-gray-300">
          Category: {categoryConfig.label}
        </p>
      </div>
    );
  }

  // Format value based on type
  const formatValue = (field, value) => {
    if (value === undefined || value === null || value === '') {
      return <span className="text-gray-400">—</span>;
    }

    if (Array.isArray(value)) {
      return value.join(", ");
    }

    // Boolean-like values with icons
    if (value === "Yes" || value === true) {
      return (
        <span className="inline-flex items-center gap-1 text-green-600">
          <HiCheckCircle className="w-4 h-4" />
          Yes
        </span>
      );
    }

    if (value === "No" || value === false) {
      return (
        <span className="inline-flex items-center gap-1 text-gray-500">
          <HiXCircle className="w-4 h-4" />
          No
        </span>
      );
    }

    return String(value);
  };

  return (
    <div>
      {/* Category Title */}
      <h3 className="text-base font-semibold text-gray-900 mb-6 flex items-center gap-2 border-b pb-4">
        <HiClipboardList className="w-5 h-5 text-gray-600" />
        {categoryConfig.label} Specifications
      </h3>

      {/* Specifications Table */}
      <div className="divide-y divide-gray-100">
        {visibleFields.map((field, idx) => (
          <div
            key={field.name}
            className={`flex py-3 ${idx % 2 === 0 ? 'bg-gray-50' : 'bg-white'} -mx-6 px-6`}
          >
            <span className="text-gray-500 w-2/5 text-sm font-medium">
              {field.label}
            </span>
            <span className="text-gray-900 w-3/5 text-sm">
              {formatValue(field, attributes[field.name])}
            </span>
          </div>
        ))}
      </div>

      {/* Category Info Footer */}
      <div className="mt-6 pt-4 border-t">
        <div className="flex items-center gap-4 text-xs text-gray-400">
          <span>
            Category: <span className="text-gray-500">{categoryName || 'N/A'}</span>
          </span>
          {subcategoryName && (
            <>
              <span className="text-gray-300">•</span>
              <span>
                Subcategory: <span className="text-gray-500">{subcategoryName}</span>
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default DynamicSpecifications;
