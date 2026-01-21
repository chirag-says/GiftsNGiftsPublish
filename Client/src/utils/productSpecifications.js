/**
 * Product Specifications Utility
 * Professional product specifications display
 * Only shows relevant fields based on product category
 */

// Categories that should show "Ingredients" field
const FOOD_CATEGORIES = [
  'cakes', 'bakery', 'food', 'grocery', 'sweets', 'snacks',
  'beverages', 'dairy', 'confectionery', 'organic food',
  'brownie', 'pastry', 'chocolate', 'dessert', 'cookies', 'biscuits',
  'pickle', 'jam', 'honey', 'spices', 'masala', 'oil', 'ghee',
  'tea', 'coffee', 'health drink', 'juice', 'sauce', 'ketchup'
];

// Categories that should show "Care Instructions" (textiles/fashion)
const TEXTILE_CATEGORIES = [
  'sarees', 'shawls', 'women_wear', 'men_wear', 'clothing',
  'fashion', 'garments', 'textiles', 'apparel'
];

/**
 * Check if a category is food-related
 */
const isFoodCategory = (categoryName) => {
  if (!categoryName) return false;
  const normalized = categoryName.toLowerCase();
  return FOOD_CATEGORIES.some(cat => normalized.includes(cat));
};

/**
 * Check if a category is textile-related
 */
const isTextileCategory = (categoryName) => {
  if (!categoryName) return false;
  const normalized = categoryName.toLowerCase();
  return TEXTILE_CATEGORIES.some(cat => normalized.includes(cat));
};

/**
 * Get category name from product (handles both string and object)
 */
const getCategoryName = (product) => {
  if (!product) return '';
  if (typeof product.categoryname === 'string') return product.categoryname;
  if (product.categoryname?.name) return product.categoryname.name;
  if (product.categoryname?.categoryname) return product.categoryname.categoryname;
  return '';
};

/**
 * Get static specifications - filtered based on category
 * Only returns fields that have values and are relevant to the category
 */
export const getStaticSpecifications = (product) => {
  const categoryName = getCategoryName(product);
  const isFood = isFoodCategory(categoryName);

  const allSpecs = [
    { label: "Brand", value: product.brand },
    { label: "Size", value: product.size },
    { label: "Material Composition", value: product.materialComposition },
    { label: "Outer Material", value: product.outerMaterial },
    { label: "Product Dimensions", value: product.productDimensions },
    { label: "Item Dimensions (LxWxH)", value: product.itemDimensionsLxWxH },
    { label: "Item Weight", value: product.itemWeight },
    { label: "Net Quantity", value: product.netQuantity },
    { label: "Generic Name", value: product.genericName },
    { label: "Manufacturer", value: product.manufacturer },
    { label: "Packer", value: product.packer },
    { label: "Country of Origin", value: product.countryOfOrigin },
  ];

  return allSpecs.filter(item =>
    item.value &&
    item.value !== "" &&
    item.value !== "undefined" &&
    item.value !== "null"
  );
};

/**
 * Get grouped specifications - organized by groups
 * Only shows relevant groups based on product category
 */
export const getGroupedSpecifications = (product) => {
  const groups = {};
  const categoryName = getCategoryName(product);
  const isFood = isFoodCategory(categoryName);

  // Group 1: General Information
  const generalInfo = [
    { label: "Brand", value: product.brand },
    { label: "Generic Name", value: product.genericName },
    { label: "Manufacturer", value: product.manufacturer },
    { label: "Packer", value: product.packer },
    { label: "Country of Origin", value: product.countryOfOrigin },
    { label: "Department", value: product.department },
  ].filter(item => item.value && item.value !== "" && item.value !== "undefined");

  if (generalInfo.length > 0) {
    groups["General Information"] = generalInfo;
  }

  // Group 2: Product Dimensions & Measurements
  const dimensions = [
    { label: "Product Dimensions", value: product.productDimensions },
    { label: "Item Dimensions (L x W x H)", value: product.itemDimensionsLxWxH },
    { label: "Item Weight", value: product.itemWeight },
    { label: "Net Quantity", value: product.netQuantity },
    { label: "Size", value: product.size },
    { label: "Length", value: product.length },
  ].filter(item => item.value && item.value !== "" && item.value !== "undefined");

  if (dimensions.length > 0) {
    groups["Product Dimensions"] = dimensions;
  }

  // Group 3: Material & Composition (only for non-food items)
  if (!isFood) {
    const materials = [
      { label: "Material Composition", value: product.materialComposition },
      { label: "Outer Material", value: product.outerMaterial },
    ].filter(item => item.value && item.value !== "" && item.value !== "undefined");

    if (materials.length > 0) {
      groups["Material & Composition"] = materials;
    }
  }

  // Group 4: Technical Details
  const technical = [
    { label: "GNG ID", value: product.gngId || product.asin }, // Prioritize GNGID
    { label: "Item Part Number", value: product.itemPartNumber },
    { label: "HSN Code", value: product.hsnCode },
    { label: "GST Rate", value: product.gstRate ? `${product.gstRate}%` : null },
    { label: "Minimum Order Quantity", value: product.moq && product.moq > 1 ? product.moq : null },
    {
      label: "Date First Available", value: product.dateFirstAvailable
        ? new Date(product.dateFirstAvailable).toLocaleDateString('en-IN', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })
        : null
    },
  ].filter(item => item.value && item.value !== "" && item.value !== "undefined");

  if (technical.length > 0) {
    groups["Technical Details"] = technical;
  }

  // Group 5: Care Instructions (only for textiles/fashion)
  if (product.careInstructions && isTextileCategory(categoryName)) {
    groups["Care Instructions"] = [
      { label: "Care Instructions", value: product.careInstructions },
    ];
  }

  // Group 6: Compliance & Certification
  const compliance = [];

  if (product.fssaiRequired && product.fssaiLicenseNumber) {
    compliance.push({ label: "FSSAI License", value: product.fssaiLicenseNumber });
  }
  if (product.bisRequired && product.bisCertificateNumber) {
    compliance.push({ label: "BIS Certificate", value: product.bisCertificateNumber });
  }
  if (product.drugLicenseRequired && product.drugLicenseNumber) {
    compliance.push({ label: "Drug License", value: product.drugLicenseNumber });
  }
  if (product.isImported) {
    if (product.importerName) compliance.push({ label: "Importer", value: product.importerName });
    if (product.importerAddress) compliance.push({ label: "Importer Address", value: product.importerAddress });
  }

  if (compliance.length > 0) {
    groups["Compliance & Certification"] = compliance;
  }

  return groups;
};

/**
 * Get highlights/key features from the product
 * Parses aboutThisItem and additional_details for bullet points
 */
export const getProductHighlights = (product) => {
  const highlights = [];

  // Parse aboutThisItem - could be newline or bullet separated
  if (product.aboutThisItem) {
    const items = product.aboutThisItem
      .split(/[\n•●\-]/)
      .map(item => item.trim())
      .filter(item => item.length > 0 && item.length < 500);
    highlights.push(...items);
  }

  // Add additional_details as a highlight if present
  if (product.additional_details && !highlights.some(h => h === product.additional_details)) {
    const additionalItems = product.additional_details
      .split(/[\n•●\-]/)
      .map(item => item.trim())
      .filter(item => item.length > 0 && item.length < 500);
    highlights.push(...additionalItems);
  }

  return highlights.slice(0, 10); // Limit to 10 highlights
};

/**
 * Check if product has any specifications to show
 */
export const hasSpecifications = (product) => {
  const staticSpecs = getStaticSpecifications(product);
  const groupedSpecs = getGroupedSpecifications(product);
  const hasAttributes = product.attributes && Object.keys(product.attributes).length > 0;

  return staticSpecs.length > 0 || Object.keys(groupedSpecs).length > 0 || hasAttributes;
};

/**
 * Check if product should show ingredients (only for food products)
 */
export const shouldShowIngredients = (product) => {
  const categoryName = getCategoryName(product);
  return isFoodCategory(categoryName) && product.ingredients;
};

/**
 * Get a summary of key specifications for quick display
 */
export const getQuickSpecs = (product) => {
  const quickSpecs = [];

  if (product.brand) quickSpecs.push({ label: "Brand", value: product.brand });
  if (product.size) quickSpecs.push({ label: "Size", value: product.size });
  if (product.materialComposition || product.outerMaterial) {
    quickSpecs.push({
      label: "Material",
      value: product.materialComposition || product.outerMaterial
    });
  }
  if (product.countryOfOrigin) quickSpecs.push({ label: "Origin", value: product.countryOfOrigin });
  if (product.itemWeight) quickSpecs.push({ label: "Weight", value: product.itemWeight });

  return quickSpecs.slice(0, 5);
};
