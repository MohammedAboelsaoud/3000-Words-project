import type * as React from 'react';

/** Sentence text. Wrap the ONE changing slot / new chunk in square brackets: "Ich hätte gern [die Rechnung]." */
export type SlottedText = string;
export type Grade = 'again' | 'hard' | 'good' | 'easy';

export interface StartButtonProps { minutes?: number; label?: string; onClick?: () => void; disabled?: boolean; className?: string }
export declare function StartButton(props: StartButtonProps): React.ReactElement;

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> { variant?: 'quiet' | 'primary' | 'text' }
export declare function Button(props: ButtonProps): React.ReactElement;

export interface AudioButtonProps { speed?: 'natural' | 'slow'; voice?: string; playing?: boolean; onClick?: () => void }
export declare function AudioButton(props: AudioButtonProps): React.ReactElement;

export interface SlotTextProps { text: SlottedText; highlight?: boolean }
export declare function SlotText(props: SlotTextProps): React.ReactElement;

export interface SentenceCardProps {
  text: SlottedText; gloss?: string; glossDir?: 'ltr' | 'rtl'; glossLang?: string; lang?: string;
  band?: string; theme?: string; hidden?: boolean;
  media?: React.ReactNode; audio?: React.ReactNode; children?: React.ReactNode; className?: string;
}
export declare function SentenceCard(props: SentenceCardProps): React.ReactElement;

export interface AlignmentToken { de: string; gloss?: string; mark?: 'slot' | 'none' | 'moves' }
export interface AlignmentStripProps { tokens: AlignmentToken[]; glossDir?: 'ltr' | 'rtl'; glossLang?: string; note?: string }
export declare function AlignmentStrip(props: AlignmentStripProps): React.ReactElement;

export interface FamilyListProps { sentences: SlottedText[]; frame?: string; revealed?: boolean }
export declare function FamilyList(props: FamilyListProps): React.ReactElement;

export interface ChangePairProps { a: SlottedText; b: SlottedText; note?: string }
export declare function ChangePair(props: ChangePairProps): React.ReactElement;

export interface RuleCardProps { frame: string; rule: string }
export declare function RuleCard(props: RuleCardProps): React.ReactElement;

export interface TaskHeaderProps { instruction: string; reason?: string; showReason?: boolean; progress?: number }
export declare function TaskHeader(props: TaskHeaderProps): React.ReactElement;

export interface ChoiceOptionProps { state?: 'idle' | 'selected' | 'correct' | 'wrong'; dir?: 'ltr' | 'rtl'; lang?: string; onClick?: () => void; disabled?: boolean; children?: React.ReactNode }
export declare function ChoiceOption(props: ChoiceOptionProps): React.ReactElement;

export interface DiffToken { text?: string; expected?: string; status?: 'ok' | 'wrong' | 'missing' | 'extra' }
export interface DictationDiffProps { tokens: DiffToken[]; errorTag?: 'lexical' | 'word order' | 'case or agreement' | 'mishearing' | 'spelling' | string }
export declare function DictationDiff(props: DictationDiffProps): React.ReactElement;

export interface SpokenWord { text: string; flag?: 'mispronounced' | 'omitted' }
export interface SpeakFeedbackProps { words: SpokenWord[]; score?: number }
export declare function SpeakFeedback(props: SpeakFeedbackProps): React.ReactElement;

export interface SelfGradeProps { value?: 'again' | 'hard' | 'good'; onGrade?: (g: 'again' | 'hard' | 'good') => void }
export declare function SelfGrade(props: SelfGradeProps): React.ReactElement;

export interface GradeChipProps { grade: Grade; auto?: boolean; onOverride?: () => void }
export declare function GradeChip(props: GradeChipProps): React.ReactElement;

export interface BandRoadmapProps { sentences: number }
export declare function BandRoadmap(props: BandRoadmapProps): React.ReactElement;

export interface SessionCloseProps { recallPct: number; total: number; nextCheckpoint?: number; toNext?: number; tomorrowMin?: number }
export declare function SessionClose(props: SessionCloseProps): React.ReactElement;

export type DayState = 'done' | 'frozen' | 'missed' | 'today' | 'future';
export interface StreakMeterProps { days: number; freezes?: 0 | 1 | 2; week: DayState[] }
export declare function StreakMeter(props: StreakMeterProps): React.ReactElement;

export interface RecoveryNoticeProps { date: string; children?: React.ReactNode }
export declare function RecoveryNotice(props: RecoveryNoticeProps): React.ReactElement;

export interface EvidenceTagProps { level: 'strong' | 'moderate' | 'weak' | 'company' | 'inference'; title?: string }
export declare function EvidenceTag(props: EvidenceTagProps): React.ReactElement;

declare global {
  interface Window {
    Satz: {
      StartButton: typeof StartButton; Button: typeof Button; AudioButton: typeof AudioButton; SlotText: typeof SlotText;
      SentenceCard: typeof SentenceCard; AlignmentStrip: typeof AlignmentStrip; FamilyList: typeof FamilyList;
      ChangePair: typeof ChangePair; RuleCard: typeof RuleCard; TaskHeader: typeof TaskHeader; ChoiceOption: typeof ChoiceOption;
      DictationDiff: typeof DictationDiff; SpeakFeedback: typeof SpeakFeedback; SelfGrade: typeof SelfGrade; GradeChip: typeof GradeChip;
      BandRoadmap: typeof BandRoadmap; SessionClose: typeof SessionClose; StreakMeter: typeof StreakMeter;
      RecoveryNotice: typeof RecoveryNotice; EvidenceTag: typeof EvidenceTag;
      parseSlots(text: string): { t: string; slot?: boolean }[];
    };
  }
}
