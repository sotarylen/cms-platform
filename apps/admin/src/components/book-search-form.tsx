type Props = {
  query?: string;
  source?: string;
  minChapters?: string;
};

export function BookSearchForm({
  query = '',
  source = '',
  minChapters = '',
}: Props) {
  return (
    <form className="filter-form" method="get">
      <input
        type="search"
        name="query"
        placeholder="按书名或作者搜索..."
        defaultValue={query}
      />
      <input
        type="search"
        name="source"
        placeholder="来源（例如 xChina）"
        defaultValue={source}
      />
      <input
        type="number"
        name="minChapters"
        placeholder="最少章节数"
        min="0"
        defaultValue={minChapters}
      />
      {/* 状态筛选已移除 — 使用最小章节数过滤代替 */}
      <button type="submit">应用筛选</button>
    </form>
  );
}

