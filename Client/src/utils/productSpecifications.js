export const getStaticSpecifications = (product) => {
  return [
    { label: "Brand", value: product.brand },
    { label: "Size", value: product.size },
    { label: "Material Composition", value: product.materialComposition },
    { label: "Outer Material", value: product.outerMaterial },
    { label: "Product Dimensions", value: product.productDimensions },
    { label: "Item Dimensions (LxWxH)", value: product.itemDimensionsLxWxH },
    { label: "Item Weight", value: product.itemWeight },
    { label: "Net Quantity", value: product.netQuantity },
    { label: "Generic Name", value: product.genericName },
    { label: "ASIN", value: product.asin },
    { label: "Item Part Number", value: product.itemPartNumber },
    { label: "Manufacturer", value: product.manufacturer },
    { label: "Packer", value: product.packer },
    { label: "Department", value: product.department },
    { label: "Country of Origin", value: product.countryOfOrigin },
    { label: "HSN Code", value: product.hsnCode },
    { label: "GST Rate", value: product.gstRate ? `${product.gstRate}%` : null },
    { label: "Minimum Order Quantity", value: product.moq },
    { label: "Warranty", value: product.warranty },
    { label: "Date First Available", value: product.dateFirstAvailable
        ? new Date(product.dateFirstAvailable).toLocaleDateString()
        : null
    },
  ].filter(item => item.value); // 🔥 show only filled values
};
