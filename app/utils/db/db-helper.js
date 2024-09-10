import sql from "../../config/db.js";

/**
 * @typedef {Object} FilterConditions
 * @property {Object} filters - Key-value pairs for filtering data.
 * @property {Array} values - Array of values to be used in query placeholders.
 */

/**
 * Builds filter conditions for WHERE clauses.
 * @param {Object} filters - The filter conditions.
 * @param {Array} values - The array of values to be used in query placeholders.
 * @returns {string} The WHERE clause conditions.
 */
const buildFilterConditions = (filters, values) => {
    return Object.keys(filters)
        .map((key) => {
            if (filters[key] !== undefined && filters[key] !== null && filters[key] !== '') {
                values.push(filters[key]);
                return `${key} = $${values.length}`;
            }
            return null;
        })
        .filter((condition) => condition !== null)
        .join(' AND ');
};

/**
 * Builds search condition for full-text search.
 * @param {string} search - The search term.
 * @param {string[]} searchColumns - The columns to be searched.
 * @param {Array} values - The array of values to be used in query placeholders.
 * @returns {string} The search condition.
 */
const buildSearchCondition = (search, searchColumns, values) => {
    if (search && searchColumns.length > 0) {
        const concatenatedColumns = searchColumns.map((column) => `COALESCE(${column}::TEXT, '')`).join(` || ' ' || `);
        values.push(`%${search.toLowerCase()}%`);
        return `LOWER(CONCAT(${concatenatedColumns})) LIKE LOWER($${values.length})`;
    }
    return '';
};

/**
 * Builds GROUP BY clause.
 * @param {string[]} groupByColumns - The columns to group by.
 * @returns {string} The GROUP BY clause.
 */
const buildGroupByClause = (groupByColumns) => {
    return groupByColumns.length > 0 ? 'GROUP BY ' + groupByColumns.join(', ') : '';
};

/**
 * Builds HAVING clause.
 * @param {Object} conditions - The conditions for HAVING clause.
 * @param {Array} values - The array of values to be used in query placeholders.
 * @returns {string} The HAVING clause.
 */
const buildHavingClause = (conditions, values) => {
    const havingConditions = buildFilterConditions(conditions, values);
    return havingConditions ? 'HAVING ' + havingConditions : '';
};

/**
 * Builds ORDER BY clause.
 * @param {Object} orderBy - The order by object containing column and order.
 * @returns {string} The ORDER BY clause.
 */
const buildOrderByClause = (orderBy) => {
    return orderBy ? `ORDER BY ${orderBy.column} ${orderBy.order.toUpperCase()}` : '';
};

/**
 * Builds WHERE clause with default conditions.
 * @param {Object} conditions - The conditions for WHERE clause.
 * @param {Array} values - The array of values to be used in query placeholders.
 * @returns {string} The WHERE clause.
 */
const buildWhereClause = (conditions, values) => {
    const whereConditions = buildFilterConditions(conditions, values);
    return whereConditions ? 'AND ' + whereConditions : '';
};

/**
 * Builds a paginated query with placeholder replacements.
 * @param {Object} params - Parameters for pagination query builder.
 * @param {string} params.baseQuery - The base query string.
 * @param {Object[]} [params.placeholders=[]] - Placeholder objects to replace in the query.
 * @param {number} [params.page=1] - The page number for pagination.
 * @param {number} [params.pageSize=10] - The number of items per page.
 * @param {string} [params.search=''] - The search term.
 * @param {string[]} [params.searchColumns=[]] - Columns to be searched.
 * @param {boolean} [params.includeTotalCount=false] - Whether to include total count in the result.
 * @returns {Promise<Object>} The query result containing data and possibly total count.
 */
const paginationQueryBuilderWithPlaceholder = async ({
    baseQuery,
    placeholders = [],
    page = 1,
    pageSize = 10,
    search = '',
    includeTotalCount = false,
}) => {
    let query = baseQuery;
    const values = [];

    // Default WHERE clause
    const defaultWhereClause = ' WHERE 1=1 ';

    // Replace placeholders with actual conditions
    placeholders.forEach(({ placeholder, filters, groupBy, having, orderBy, defaultFilters, searchColumns }) => {
        let replacement = defaultFilters || defaultWhereClause;

        if (filters) {
            replacement += ' ' + buildWhereClause(filters, values);
        }
        if (groupBy) {
            replacement += ' ' + buildGroupByClause(groupBy);
        }
        if (having) {
            replacement += ' ' + buildHavingClause(having, values);
        }
        if (orderBy) {
            replacement += ' ' + buildOrderByClause(orderBy);
        }

        if (searchColumns) {
            const searchCondition = buildSearchCondition(search, searchColumns, values);
            if (searchCondition) {
                replacement += ' ' + (replacement.toLowerCase().includes('where') ? ' AND ' : ' WHERE ') + searchCondition;
            }
        }

        query = query.replace(placeholder, replacement);
    });

    let totalCount = 0;
    if (includeTotalCount) {
        // Adding pagination
        const offset = (page - 1) * pageSize;
        values.push(pageSize, offset);
        query += ` LIMIT $${values.length - 1} OFFSET $${values.length}`;

        // Construct the total count query
        const totalCountQuery = `SELECT COUNT(*) FROM (${query}) as subquery`;

        // Execute both queries concurrently
        const [dataRes, countRes] = await Promise.all([
            sql.unsafe(query, values),
            sql.unsafe(totalCountQuery, values),
        ]);

        totalCount = parseInt(countRes[0].count.toString(), 10);
        return {
            data: dataRes,
            total: totalCount,
        };
    } else {
        // Adding pagination
        const offset = (page - 1) * pageSize;
        values.push(pageSize, offset);
        query += ` LIMIT $${values.length - 1} OFFSET $${values.length}`;
        const dataRes = await sql.unsafe(query, values);
        return {
            data: dataRes,
        };
    }
};

/**
 * Builds an infinite scroll query with placeholder replacements.
 * @param {Object} params - Parameters for infinite scroll query builder.
 * @param {string} params.baseQuery - The base query string.
 * @param {Object[]} [params.placeholders=[]] - Placeholder objects to replace in the query.
 * @param {Object} [params.cursor] - The cursor for pagination, containing column and value.
 * @param {string} [params.search=''] - The search term.
 * @param {string[]} [params.searchColumns=[]] - Columns to be searched.
 * @param {boolean} [params.includeTotalCount=false] - Whether to include total count in the result.
 * @returns {Promise<Object>} The query result containing data, possibly total count, and next cursor.
 */
export const infiniteScrollQueryBuilderWithPlaceholder = async ({
    baseQuery,
    placeholders = [],
    cursor,
    search = '',
    includeTotalCount = false,
}) => {
    let query = baseQuery;
    const values = [];

    // Default WHERE clause
    const defaultWhereClause = ' WHERE 1=1 ';

    // Replace placeholders with actual conditions
    placeholders.forEach(({ placeholder, filters, groupBy, having, orderBy, defaultFilters, searchColumns }) => {
        let replacement = defaultFilters || defaultWhereClause;

        if (filters) {
            replacement += ' ' + buildWhereClause(filters, values);
        }
        if (groupBy) {
            replacement += ' ' + buildGroupByClause(groupBy);
        }
        if (having) {
            replacement += ' ' + buildHavingClause(having, values);
        }
        if (orderBy) {
            replacement += ' ' + buildOrderByClause(orderBy);
        }

        if (searchColumns) {
            const searchCondition = buildSearchCondition(search, searchColumns, values);
            if (searchCondition) {
                replacement += ' ' + (replacement.toLowerCase().includes('where') ? ' AND ' : ' WHERE ') + searchCondition;
            }
        }
        query = query.replace(placeholder, replacement);
    });

    // Add cursor-based pagination
    if (cursor && cursor.value) {
        values.push(cursor.value);
        query +=
            (query.toLowerCase().includes('where') ? ' AND ' : ' WHERE ') +
            `${cursor.column} ${placeholders.find((p) => p.orderBy)?.orderBy?.order === 'asc' ? '>' : '<'} $${values.length}`;
    }

    // Adding limit
    const limit = process.env.DEFAULT_LIMIT;
    values.push(limit);
    query += ` LIMIT $${values.length}`;
    let totalCount = 0;
    if (includeTotalCount) {
        // Construct the total count query without cursor and limit
        const totalCountQuery = `SELECT COUNT(*) FROM (${baseQuery}) as subquery`;

        // Execute both queries concurrently
        const [dataRes, countRes] = await Promise.all([
            sql.unsafe(query, values),
            sql.unsafe(totalCountQuery, values),
        ]);

        totalCount = parseInt(countRes[0].count.toString(), 10);
        return {
            data: dataRes,
            total: totalCount,
            nextCursor: dataRes.length ? dataRes[orderBy?.order === 'asc' ? 0 : dataRes.length - 1].id : null,
        };
    } else {
        console.log('Query:', query);
        console.log('Values:', values);
        const dataRes = await sql.unsafe(query, values);
        return {
            data: dataRes,
            nextCursor: dataRes.length
                ? dataRes[placeholders.find((p) => p.orderBy)?.orderBy?.order === 'asc' ? 0 : dataRes.length - 1].id
                : null,
        };
    }
};

export const formatQueryWithValues = (query, values) => {
    let formattedQuery = query;
 
    values.forEach((value, index) => {
       // Convert value to string and escape single quotes
       const valueStr = typeof value === 'string' ? `'${value.replace(/'/g, "''")}'` : value;
 
       // Replace the placeholder with the value
       formattedQuery = formattedQuery.replace(`$${index + 1}`, valueStr.toString());
    });
 
    console.log('Formatted SQL Query:', formattedQuery);
 };
 