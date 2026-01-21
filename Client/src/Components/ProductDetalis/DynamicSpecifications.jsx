import React from "react";
import { getAttributesForCategory } from "../../utils/categoryAttributes";

const DynamicSpecifications = ({ product }) => {
  const attributes = product?.attributes || {};

  const categoryName =
    typeof product?.categoryname === "string"
      ? product.categoryname
      : product?.categoryname?.name;

  if (!categoryName) return null;

  const categoryConfig = getAttributesForCategory(categoryName);
  if (!categoryConfig?.fields?.length) return null;

  const visibleFields = categoryConfig.fields.filter(field => {
    const value = attributes[field.name];
    return value !== undefined && value !== null && value !== "";
  });

  if (!visibleFields.length) return null;

  return (
    <div className="bg-gray-50 rounded-2xl p-6">
      <h3 className="text-lg font-bold text-gray-800 mb-4">
        {categoryConfig.label} Specifications
      </h3>

      <div className="space-y-3">
        {visibleFields.map(field => (
          <div key={field.name} className="flex justify-between py-2 border-b last:border-0">
            <span className="text-gray-500">{field.label}</span>
            <span className="text-gray-800 font-medium">
              {Array.isArray(attributes[field.name])
                ? attributes[field.name].join(", ")
                : attributes[field.name]}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DynamicSpecifications;
