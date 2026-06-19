'use client';
import { Button, Input, Textarea } from '@heroui/react';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, useReducedMotion } from 'motion/react';
import { FiCheckCircle, FiAlertCircle, FiMail } from 'react-icons/fi';

type Status = 'idle' | 'sending' | 'success' | 'error';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Contact() {
  const { t } = useTranslation('common');
  const reduceMotion = useReducedMotion();

  const [values, setValues] = useState({ email: '', name: '', message: '' });
  const [errors, setErrors] = useState<{
    email?: string;
    name?: string;
    message?: string;
  }>({});
  const [status, setStatus] = useState<Status>('idle');

  const validate = () => {
    const next: typeof errors = {};
    if (!EMAIL_RE.test(values.email.trim())) next.email = t('contact-err-email');
    if (!values.name.trim()) next.name = t('contact-err-name');
    if (!values.message.trim()) next.message = t('contact-err-desc');
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status === 'sending') return;
    if (!validate()) return;

    setStatus('sending');
    try {
      // No backend is wired yet. Replace this with a POST to your endpoint
      // (e.g. /api/contact) when one exists.
      await new Promise((resolve) => setTimeout(resolve, 900));
      setStatus('success');
      setValues({ email: '', name: '', message: '' });
    } catch {
      setStatus('error');
    }
  };

  const reveal = reduceMotion
    ? { initial: false as const }
    : {
        initial: { opacity: 0, y: 24 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true, amount: 0.2 },
        transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as const },
      };

  return (
    <section
      id="contact"
      className="mx-auto w-full max-w-6xl scroll-mt-20 px-4 py-24 sm:px-8 lg:py-32"
    >
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
        {/* Left: intro */}
        <motion.div {...reveal}>
          <h2 className="font-display text-4xl font-bold leading-[1.05] tracking-tight text-ink sm:text-6xl lg:text-7xl">
            {t('contact-title')}
          </h2>
          <div className="accent-rule mt-5" />
          <p className="mt-6 max-w-[42ch] text-base leading-7 text-ink-soft">
            {t('contact-subtitle')}
          </p>
          <a
            href="mailto:linhbaljeet0208@gmail.com"
            className="mt-8 inline-flex items-center gap-2.5 text-base font-semibold text-accent-deep transition-colors hover:text-ink"
          >
            <FiMail aria-hidden="true" />
            linhbaljeet0208@gmail.com
          </a>
        </motion.div>

        {/* Right: form */}
        <motion.form
          noValidate
          onSubmit={handleSubmit}
          className="flex flex-col gap-6"
          {...reveal}
        >
          <Input
            type="email"
            name="email"
            label={t('contact-email')}
            placeholder={t('contact-enter-mail')}
            labelPlacement="outside"
            variant="bordered"
            value={values.email}
            onValueChange={(v) => setValues((s) => ({ ...s, email: v }))}
            isInvalid={!!errors.email}
            errorMessage={errors.email}
            isRequired
            classNames={{ inputWrapper: 'border-line data-[hover=true]:border-accent group-data-[focus=true]:border-accent' }}
          />
          <Input
            name="name"
            label={t('contact-name')}
            placeholder={t('contact-enter-name')}
            labelPlacement="outside"
            variant="bordered"
            value={values.name}
            onValueChange={(v) => setValues((s) => ({ ...s, name: v }))}
            isInvalid={!!errors.name}
            errorMessage={errors.name}
            isRequired
            classNames={{ inputWrapper: 'border-line data-[hover=true]:border-accent group-data-[focus=true]:border-accent' }}
          />
          <Textarea
            name="message"
            label={t('contact-desc')}
            placeholder={t('contact-enter-desc')}
            labelPlacement="outside"
            variant="bordered"
            minRows={4}
            value={values.message}
            onValueChange={(v) => setValues((s) => ({ ...s, message: v }))}
            isInvalid={!!errors.message}
            errorMessage={errors.message}
            isRequired
            classNames={{ inputWrapper: 'border-line data-[hover=true]:border-accent group-data-[focus=true]:border-accent' }}
          />

          <div className="flex flex-wrap items-center gap-4">
            <Button
              type="submit"
              radius="full"
              isLoading={status === 'sending'}
              className="bg-accent px-7 py-6 text-base font-semibold text-cream shadow-lg shadow-accent/20 transition-all duration-300 hover:-translate-y-0.5 hover:bg-accent-deep active:translate-y-0"
            >
              {status === 'sending' ? t('contact-sending') : t('contact-send')}
            </Button>

            <div aria-live="polite" className="text-sm font-medium">
              {status === 'success' && (
                <span className="inline-flex items-center gap-2 text-accent-deep">
                  <FiCheckCircle aria-hidden="true" />
                  {t('contact-success')}
                </span>
              )}
              {status === 'error' && (
                <span className="inline-flex items-center gap-2 text-red-700">
                  <FiAlertCircle aria-hidden="true" />
                  {t('contact-error')}
                </span>
              )}
            </div>
          </div>
        </motion.form>
      </div>
    </section>
  );
}
