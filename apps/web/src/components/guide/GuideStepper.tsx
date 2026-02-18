'use client';

import { cn } from '@/lib/utils';

const STEPS = [
  { id: 1, label: 'Create room' },
  { id: 2, label: 'Share link' },
  { id: 3, label: 'Send file' },
];

interface GuideStepperProps {
  currentStep: number;
  className?: string;
}

export function GuideStepper({ currentStep, className }: GuideStepperProps) {
  return (
    <nav aria-label="Progress" className={cn('flex items-center justify-center gap-2', className)}>
      {STEPS.map((step, index) => {
        const isActive = currentStep === step.id;
        const isPast = currentStep > step.id;
        return (
          <div key={step.id} className="flex items-center">
            <div
              className={cn(
                'flex items-center justify-center w-8 h-8 rounded-full text-xs font-medium transition-colors',
                isActive && 'bg-teal-500 text-white',
                isPast && 'bg-teal-100 text-teal-700 dark:bg-teal-500/30 dark:text-teal-300',
                !isActive && !isPast && 'bg-slate-500/20 text-[var(--text-muted)] border border-[var(--border-soft)]'
              )}
              aria-current={isActive ? 'step' : undefined}
            >
              {isPast ? '✓' : step.id}
            </div>
            {index < STEPS.length - 1 && (
              <div
                className={cn(
                  'w-8 h-0.5 mx-0.5',
                  isPast ? 'bg-teal-500/50' : 'bg-[var(--border-soft)]'
                )}
              />
            )}
          </div>
        );
      })}
    </nav>
  );
}
