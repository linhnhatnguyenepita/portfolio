import Header from './ui/header';
import About from './components/about';
import CaseStudy from './components/case_study';
import Contact from './components/contact';
import Hero from './components/hero';
import initTranslations from '../i18n';
import TranslationProvider from '@/app/[locale]/components/TranslationProvider';

type Locale = 'en' | 'fr' | string;

interface HomeProps {
  params: Promise<{
    locale: Locale;
  }>;
}

export default async function Home({ params }: HomeProps) {
  const { locale } = await params;
  const { t, resources } = await initTranslations(locale, ['common']);
  return (
    <TranslationProvider
      resources={resources}
      locale={locale}
      namespaces={['common']}
    >
      <Header />
      <div className="flex flex-col w-full font-sans items-center justify-start">
        <Hero />
        <About />
        <CaseStudy />
        <Contact />
        {/* <iframe
          className="rounded-lg fixed bottom-5 right-1/2 transform translate-x-1/2 w-full sm:w-3/4 md:w-1/2 lg:w-1/3"
          src="https://open.spotify.com/embed/track/2plbrEY59IikOBgBGLjaoe?utm_source=generator"
          height="80"
          allowFullScreen
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          loading="lazy"
        ></iframe> */}
      </div>
    </TranslationProvider>
  );
}
