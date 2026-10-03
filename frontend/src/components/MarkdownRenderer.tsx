'use client';

import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import { cn } from '@/lib/utils';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export default function MarkdownRenderer({ content, className = '' }: MarkdownRendererProps) {
  if (!content) return null;

  // Tiền xử lý:
  // 1. Chuyển các dấu đầu dòng Unicode • thành - để ReactMarkdown render đúng chuẩn <ul><li>
  // 2. Chuẩn hóa xuống dòng để đảm bảo không bị nuốt dòng khi người dùng nhập form
  const normalizedContent = content
    .replace(/^[ \t]*•[ \t]+/gm, '- ')
    .replace(/\r\n/g, '\n');

  return (
    <div
      className={cn(
        'prose prose-slate max-w-none text-xs sm:text-sm text-slate-700 leading-relaxed break-words',
        className
      )}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkBreaks]}
        components={{
          p: ({ children }) => <p className="mb-2.5 last:mb-0 leading-relaxed">{children}</p>,
          ul: ({ children }) => (
            <ul className="mb-3 space-y-1.5 pl-5 list-disc marker:text-fpt-orange last:mb-0">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="mb-3 space-y-1.5 pl-5 list-decimal marker:text-fpt-orange last:mb-0">
              {children}
            </ol>
          ),
          li: ({ children }) => <li className="leading-relaxed pl-1">{children}</li>,
          strong: ({ children }) => <strong className="font-bold text-slate-900">{children}</strong>,
          em: ({ children }) => <em className="italic text-slate-700">{children}</em>,
          h1: ({ children }) => (
            <h1 className="text-base sm:text-lg font-black text-slate-900 mt-4 mb-2 first:mt-0">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-sm sm:text-base font-bold text-slate-900 mt-3 mb-1.5 first:mt-0">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-xs sm:text-sm font-bold text-slate-900 mt-2 mb-1 first:mt-0">
              {children}
            </h3>
          ),
          blockquote: ({ children }) => (
            <blockquote className="border-l-3 border-fpt-orange bg-orange-50/50 rounded-r-lg px-3 py-1.5 my-2.5 text-slate-700 italic text-xs sm:text-sm">
              {children}
            </blockquote>
          ),
          code: ({ className, children, ...props }: any) => {
            const isCodeBlock =
              typeof children === 'string' &&
              (children.includes('\n') || (className && className.includes('language-')));
            if (!isCodeBlock) {
              return (
                <code
                  className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[11px] font-semibold text-fpt-orange"
                  {...props}
                >
                  {children}
                </code>
              );
            }
            return (
              <code
                className="block my-2 overflow-x-auto rounded-lg bg-slate-900 p-3 text-slate-100 font-mono text-xs"
                {...props}
              >
                {children}
              </code>
            );
          },
          hr: () => <hr className="my-3 border-slate-200" />,
          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-fpt-orange hover:underline"
            >
              {children}
            </a>
          ),
        }}
      >
        {normalizedContent}
      </ReactMarkdown>
    </div>
  );
}
