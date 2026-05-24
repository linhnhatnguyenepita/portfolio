import { notFound } from 'next/navigation';
import { getArticleById } from '../../lib/cases';
import getArticles from '../../lib/cases';
import CaseDetailClient from './CaseDetailClient';
import Header from '../../ui/header';
import initTranslations from '@/app/i18n';
import TranslationProvider from '../../components/TranslationProvider';

interface PageProps {
  params: Promise<{ locale: string; id: string }>;
}

export default async function CaseDetailPage({ params }: PageProps) {
  const { locale, id } = await params;
  const { resources } = await initTranslations(locale, ['common']);

  const article = await getArticleById(id);
  if (!article) notFound();

  const allArticles = await getArticles();
  const otherArticles = allArticles.filter((a) => a.id !== id);

  return (
    <TranslationProvider
      resources={resources}
      locale={locale}
      namespaces={['common']}
    >
      <Header />
      <CaseDetailClient article={article} otherArticles={otherArticles} />
    </TranslationProvider>
  );
}
