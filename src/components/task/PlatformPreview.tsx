import React from 'react';
import type { UiTask } from '../../types';
import { TaskPreview } from './TaskPreview';

/**
 * PlatformPreview — legacy entry point. The preview system now lives in
 * TaskPreview.tsx; this stays as a drop-in alias for existing callers.
 */
export const PlatformPreview: React.FC<{ task: UiTask }> = ({ task }) => <TaskPreview task={task} />;

export { classifyTaskPreview, TaskPreviewSummary } from './TaskPreview';
export type { TaskPreviewVariant, TaskPreviewProps } from './TaskPreview';
