import React, { useState } from 'react';
import {
  Sparkles,
  TrendingUp,
  Tag,
  CheckCircle2,
  ListTodo,
  Layers,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  BarChart3,
  HelpCircle,
  Lightbulb,
  Gauge,
  Smile
} from 'lucide-react';
import { DocItem, KeyPointsData, ActionItem } from '../types';
import { api } from '../lib/api';

interface KeyPointsViewerProps {
  document: DocItem;
  onDocumentUpdated: (doc: DocItem) => void;
}

export const KeyPointsViewer: React.FC<KeyPointsViewerProps> = ({
  document,
  onDocumentUpdated,
}) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeFlashcardIdx, setActiveFlashcardIdx] = useState(0);
  const [showFlashcardAnswer, setShowFlashcardAnswer] = useState(false);
  const [completedTasks, setCompletedTasks] = useState<Record<number, boolean>>({});

  const keyPoints: KeyPointsData | undefined = document.keyPoints;

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const res = await api.refreshKeyPoints(document.id);
      onDocumentUpdated(res.document);
    } catch (e) {
      console.error(e);
    } finally {
      setIsRefreshing(false);
    }
  };

  const toggleTask = (index: number) => {
    setCompletedTasks((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const flashcards = keyPoints?.flashcards || [];
  const currentCard = flashcards[activeFlashcardIdx];

  const nextCard = () => {
    setShowFlashcardAnswer(false);
    setActiveFlashcardIdx((prev) => (prev + 1) % flashcards.length);
  };

  const prevCard = () => {
    setShowFlashcardAnswer(false);
    setActiveFlashcardIdx((prev) => (prev - 1 + flashcards.length) % flashcards.length);
  };

  if (!keyPoints) {
    return (
      <div className="p-12 text-center rounded-3xl bg-white dark:bg-slate-900 border border-purple-100 dark:border-purple-900/50 space-y-4">
        <Sparkles className="w-10 h-10 text-purple-600 mx-auto animate-bounce" />
        <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
          Structured Intelligence Not Yet Extracted
        </h3>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          Click below to parse entities, quantitative metrics, action checklists, and study flashcards.
        </p>
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs shadow-md transition-all cursor-pointer"
        >
          {isRefreshing ? 'Extracting...' : 'Extract Key Intelligence'}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Meta Summary Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-purple-100 dark:border-purple-900/50 shadow-xs flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-purple-50 dark:bg-purple-950/70 text-purple-600 dark:text-purple-300 flex items-center justify-center shrink-0">
            <Gauge className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Reading Level
            </span>
            <p className="text-sm font-extrabold text-slate-900 dark:text-white">
              {keyPoints.difficulty || 'Intermediate'}
            </p>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-purple-100 dark:border-purple-900/50 shadow-xs flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-300 flex items-center justify-center shrink-0">
            <Smile className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Tone & Sentiment
            </span>
            <p className="text-sm font-extrabold capitalize text-slate-900 dark:text-white">
              {keyPoints.sentiment || 'Analytical'}
            </p>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-purple-100 dark:border-purple-900/50 shadow-xs flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-300 flex items-center justify-center shrink-0">
            <BarChart3 className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Key Metrics
            </span>
            <p className="text-sm font-extrabold text-slate-900 dark:text-white">
              {keyPoints.metrics?.length || 0} Identified
            </p>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-purple-100 dark:border-purple-900/50 shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/70 text-amber-600 dark:text-amber-300 flex items-center justify-center shrink-0">
              <ListTodo className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Action Items
              </span>
              <p className="text-sm font-extrabold text-slate-900 dark:text-white">
                {keyPoints.actionItems?.length || 0} Tasks
              </p>
            </div>
          </div>
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="p-1.5 rounded-lg text-slate-400 hover:text-purple-600 dark:hover:text-purple-300 transition-colors"
            title="Refresh Intelligence"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Grid: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Core Takeaways */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-purple-100 dark:border-purple-900/50 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-purple-100 dark:bg-purple-950/80 text-purple-600 dark:text-purple-300">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Executive Takeaways
              </h3>
              <p className="text-[11px] text-slate-400">
                High-priority conclusions extracted from the source
              </p>
            </div>
          </div>

          <div className="space-y-2.5">
            {keyPoints.takeaways.map((item, idx) => (
              <div
                key={idx}
                className="flex items-start gap-3 p-3 rounded-2xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-100 dark:border-purple-900/40"
              >
                <div className="w-5 h-5 rounded-full bg-purple-600 text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                  {idx + 1}
                </div>
                <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-200 leading-snug">
                  {item}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Quantitative Metrics & Figures */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-purple-100 dark:border-purple-900/50 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-indigo-100 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-300">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Key Metrics & Data Points
              </h3>
              <p className="text-[11px] text-slate-400">
                Quantifiable benchmarks and percentages
              </p>
            </div>
          </div>

          {keyPoints.metrics.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center">No explicit quantitative metrics detected.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {keyPoints.metrics.map((m, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40"
                >
                  <span className="block text-xl font-black text-indigo-700 dark:text-indigo-300 tracking-tight">
                    {m.metric}
                  </span>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 line-clamp-2 leading-relaxed">
                    {m.context}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Action Items Checklist */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-purple-100 dark:border-purple-900/50 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-300">
                <ListTodo className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Action Checklist & Next Steps
                </h3>
                <p className="text-[11px] text-slate-400">
                  Recommended assignments and strategic tasks
                </p>
              </div>
            </div>
            <span className="text-[11px] font-bold text-slate-400">
              {Object.values(completedTasks).filter(Boolean).length} / {keyPoints.actionItems.length} Done
            </span>
          </div>

          <div className="space-y-2">
            {keyPoints.actionItems.map((item, idx) => {
              const isChecked = !!completedTasks[idx];
              const priorityColor =
                item.priority === 'high'
                  ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/80 dark:text-rose-300 border-rose-200'
                  : item.priority === 'low'
                  ? 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200'
                  : 'bg-amber-100 text-amber-700 dark:bg-amber-950/80 dark:text-amber-300 border-amber-200';

              return (
                <div
                  key={idx}
                  onClick={() => toggleTask(idx)}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 select-none ${
                    isChecked
                      ? 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 opacity-60'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-purple-300'
                  }`}
                >
                  <div className="pt-0.5">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggleTask(idx)}
                      className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500 cursor-pointer"
                    />
                  </div>
                  <div className="flex-1">
                    <p
                      className={`text-xs sm:text-sm font-medium ${
                        isChecked
                          ? 'line-through text-slate-400 dark:text-slate-500'
                          : 'text-slate-800 dark:text-slate-200'
                      }`}
                    >
                      {item.task}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span
                        className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${priorityColor}`}
                      >
                        {item.priority}
                      </span>
                      {item.owner && (
                        <span className="text-[10px] text-slate-400">
                          Owner: {item.owner}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Interactive Study Flashcards */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-purple-100 dark:border-purple-900/50 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-amber-100 dark:bg-amber-950/80 text-amber-600 dark:text-amber-300">
                <Lightbulb className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Retention Flashcards
                </h3>
                <p className="text-[11px] text-slate-400">
                  Interactive self-testing study cards
                </p>
              </div>
            </div>

            {flashcards.length > 0 && (
              <span className="text-xs font-bold text-purple-600 dark:text-purple-400">
                {activeFlashcardIdx + 1} / {flashcards.length}
              </span>
            )}
          </div>

          {currentCard ? (
            <div className="space-y-3">
              <div
                onClick={() => setShowFlashcardAnswer(!showFlashcardAnswer)}
                className="p-6 rounded-2xl min-h-[160px] bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-950/30 dark:to-indigo-950/30 border border-purple-200 dark:border-purple-800 flex flex-col justify-between cursor-pointer transition-all hover:shadow-md select-none"
              >
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
                    {showFlashcardAnswer ? 'Answer' : 'Question (Click to flip)'}
                  </span>
                  <p className="text-sm sm:text-base font-bold text-slate-800 dark:text-slate-100 mt-2">
                    {showFlashcardAnswer ? currentCard.answer : currentCard.question}
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-[11px] text-purple-600 dark:text-purple-400 font-semibold underline">
                    {showFlashcardAnswer ? 'Show Question' : 'Reveal Answer →'}
                  </span>
                </div>
              </div>

              {/* Navigation buttons */}
              <div className="flex items-center justify-between pt-1">
                <button
                  onClick={prevCard}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Previous</span>
                </button>

                <button
                  onClick={nextCard}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                >
                  <span>Next Card</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <p className="text-xs text-slate-400 py-6 text-center">No flashcards available.</p>
          )}
        </div>
      </div>

      {/* Domain Entities & Glossary */}
      {keyPoints.entities.length > 0 && (
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-purple-100 dark:border-purple-900/50 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-blue-100 dark:bg-blue-950/80 text-blue-600 dark:text-blue-300">
              <Tag className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Domain Concepts & Terminology Glossary
              </h3>
              <p className="text-[11px] text-slate-400">
                Key entities and their definitions extracted from the document
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {keyPoints.entities.map((e, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 dark:text-white">
                    {e.term}
                  </span>
                  <span className="text-[9px] uppercase font-extrabold px-1.5 py-0.5 rounded bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300">
                    {e.category}
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-snug">
                  {e.definition}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
