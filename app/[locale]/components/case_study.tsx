import Article from './article';
import getArticles from '../lib/cases';
import Title from './title';

export default async function CaseStudy() {
  const articles = await getArticles();
  return (
    <section
      id="case"
      className="mx-auto w-full max-w-6xl scroll-mt-20 px-4 py-24 sm:px-8 lg:py-32"
    >
      <Title />
      {articles.length === 0 ? (
        <div className="mt-12 rounded-2xl border border-dashed border-line bg-surface/60 px-6 py-20 text-center">
          <p className="text-ink-soft">No case studies published yet.</p>
        </div>
      ) : (
        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {articles.map((article, i) => (
            <Article
              key={article.id}
              index={i}
              id={article.id}
              body={article.body}
              date={article.date}
              title={article.title}
              image={article.image}
            />
          ))}
        </div>
      )}
    </section>
  );
}
