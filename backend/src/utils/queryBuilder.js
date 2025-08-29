export const buildFilterQuery = ({ search, genre, author, minPrice, maxPrice }) => {
  const query = {};
  
  if (search) {
    query.$text = { $search: search };
  }
  
  if (genre) {
    query.genre = Array.isArray(genre) ? { $in: genre } : genre;
  }
  
  if (author) {
    query.author = new RegExp(author, "i");
  }
  
  if (minPrice || maxPrice) {
    query.price = {};
    if (minPrice) query.price.$gte = Number(minPrice);
    if (maxPrice) query.price.$lte = Number(maxPrice);
  }
  
  return query;
};

export const buildSortQuery = (sort) => {
  const sortOptions = {};
  
  if (sort) {
    const sortFields = sort.split(",");
    sortFields.forEach(field => {
      const sortOrder = field.startsWith("-") ? -1 : 1;
      const fieldName = field.replace(/^-/, "");
      sortOptions[fieldName] = sortOrder;
    });
  }
  
  return sortOptions;
};