import { useState } from 'react';
import type { KnowledgeQuestion } from '@/types/content';
import { Panel, Chip } from './index';

export function KnowledgeCheck({ questions, onComplete }: { questions: KnowledgeQuestion[]; onComplete?: (score: number) => void }) {
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const score = questions.filter((q) => answers[q.id] === q.answer).length / Math.max(1, questions.length);
  const submit = () => { setSubmitted(true); onComplete?.(score); };
  return (
    <div className="stack">
      {questions.map((q, qi) => {
        const chosen = answers[q.id];
        return (
          <Panel key={q.id} tight>
            <div className="row between" style={{ marginBottom: 10 }}>
              <span className="eyebrow">Question {qi + 1} of {questions.length}</span>
              {submitted && <Chip tone={chosen === q.answer ? 'green' : 'red'}>{chosen === q.answer ? 'Correct' : 'Review'}</Chip>}
            </div>
            <p style={{ color: 'var(--ivory)', fontSize: '1.02rem' }}>{q.prompt}</p>
            <div className="stack" style={{ gap: 8 }}>
              {q.options.map((opt, i) => {
                const isChosen = chosen === i;
                const correct = submitted && i === q.answer;
                const wrong = submitted && isChosen && i !== q.answer;
                return (
                  <button key={i} disabled={submitted} onClick={() => setAnswers((a) => ({ ...a, [q.id]: i }))}
                    style={{ textAlign: 'left', padding: '10px 14px', borderRadius: 10, background: isChosen ? 'rgba(201,169,97,0.12)' : 'rgba(255,255,255,0.03)', color: 'var(--ivory-2)', border: `1px solid ${correct ? 'var(--green-2)' : wrong ? 'var(--red)' : isChosen ? 'var(--gold)' : 'var(--line)'}`, fontSize: '0.95rem' }}>
                    <span className="mono muted small" style={{ marginRight: 10 }}>{String.fromCharCode(65 + i)}</span>{opt}
                  </button>
                );
              })}
            </div>
            {submitted && <p className="small" style={{ marginTop: 12, marginBottom: 0, color: 'var(--ivory-3)' }}><strong>Why:</strong> {q.explanation}</p>}
          </Panel>
        );
      })}
      <div className="row between">
        {!submitted ? (
          <button className="btn primary" disabled={Object.keys(answers).length < questions.length} onClick={submit}>Check answers</button>
        ) : (
          <>
            <span className="display" style={{ fontSize: '1.3rem' }}>Score: <span className="gold mono">{Math.round(score * 100)}%</span></span>
            <button className="btn sm" onClick={() => { setAnswers({}); setSubmitted(false); }}>Retry</button>
          </>
        )}
      </div>
    </div>
  );
}
