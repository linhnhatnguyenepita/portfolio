import { notFound } from 'next/navigation';
import { getArticleById } from '../../lib/cases';
import getArticles from '../../lib/cases';
import CaseDetailClient from './CaseDetailClient';
import Header from '../../ui/header';
import initTranslations from '@/app/i18n';
import TranslationProvider from '../../components/TranslationProvider';

interface PageProps {
  params: { locale: string; id: string };
}

export default async function CaseDetailPage({ params }: PageProps) {
  const { resources } = await initTranslations(params.locale, ['common']);

  const article = await getArticleById(params.id);
  if (!article) notFound();

  const allArticles = await getArticles();
  const otherArticles = allArticles.filter((a) => a.id !== params.id);

  return (
    <TranslationProvider
      resources={resources}
      locale={params.locale}
      namespaces={['common']}
    >
      <Header />
      <CaseDetailClient article={article} otherArticles={otherArticles} />
    </TranslationProvider>
  );
}
