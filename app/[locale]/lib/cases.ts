import moment from 'moment';
import { client, urlFor } from './sanity';
import { ArticleItem } from '../types/index';

const CASE_STUDIES_QUERY = `*[_type == "caseStudy"] | order(date desc) {
  "id": slug.current,
  title,
  date,
  body,
  image,
  category
}`;

const getArticles = async (): Promise<ArticleItem[]> => {
  const results = await client.fetch(CASE_STUDIES_QUERY);
  return results.map((item: any) => ({
    id: item.id,
    title: item.title,
    image: item.image ? urlFor(item.image) : '',
    date: item.date
      ? moment(item.date, 'YYYY-MM-DD').format('MMMM Do, YYYY')
      : '',
    body: item.body ?? '',
    category: item.category ?? '',
  }));
};

export default getArticles;

export const getArticleById = async (id: string): Promise<ArticleItem | null> => {
  const query = `*[_type == "caseStudy" && slug.current == $id][0] {
    "id": slug.current,
    title,
    date,
    body,
    image,
    category
  }`;
  const item = await client.fetch(query, { id });
  if (!item) return null;
  return {
    id: item.id,
    title: item.title,
    image: item.image ? urlFor(item.image) : '',
    date: item.date
      ? moment(item.date, 'YYYY-MM-DD').format('MMMM Do, YYYY')
      : '',
    body: item.body ?? '',
    category: item.category ?? '',
  };
};
