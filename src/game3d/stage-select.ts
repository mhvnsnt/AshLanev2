/**
 * AshLane Stage Select — Urban Reign-style quick fight setup.
 *
 * Flow: pick a stage → pick fighters → fight.
 * In story/open-world mode, stage selection is replaced by
 * physical travel between connected districts.
 */

import { STAGES, getStage, type StageDefinition } from './stages/stage-catalog';
import { assetUrl } from './asset-base';

export interface StageSelectState {
  selectedStageId: string | null;
  playerFighterId: string | null;
  opponentFighterId: string | null;
  phase: 'stage' | 'fighters' | 'ready';
}

export function createStageSelectState(): StageSelectState {
  return {
    selectedStageId: null,
    playerFighterId: null,
    opponentFighterId: null,
    phase: 'stage',
  };
}

/** All stages available for quick-fight select, with resolved URLs. */
export function getSelectableStages(): Array<StageDefinition & { thumbnailUrl: string; modelUrl: string }> {
  return STAGES.filter(s => s.bounds.x > 0).map(s => ({
    ...s,
    thumbnailUrl: assetUrl(s.thumbnailPath),
    modelUrl: assetUrl(s.modelPath),
  }));
}

export function selectStage(state: StageSelectState, stageId: string): StageSelectState {
  const stage = getStage(stageId);
  if (!stage) return state;
  return { ...state, selectedStageId: stageId, phase: 'fighters' };
}

export function selectFighters(
  state: StageSelectState,
  playerFighterId: string,
  opponentFighterId: string,
): StageSelectState {
  return { ...state, playerFighterId, opponentFighterId, phase: 'ready' };
}

export function isReadyToFight(state: StageSelectState): boolean {
  return (
    state.phase === 'ready' &&
    state.selectedStageId !== null &&
    state.playerFighterId !== null &&
    state.opponentFighterId !== null
  );
}

/** Resolve the full fight configuration for the game engine. */
export function buildFightConfig(state: StageSelectState) {
  if (!isReadyToFight(state)) throw new Error('Stage select not complete');
  const stage = getStage(state.selectedStageId!)!;
  return {
    stage: {
      ...stage,
      modelUrl: assetUrl(stage.modelPath),
      skyboxUrl: stage.skybox ? assetUrl(stage.skybox) : null,
      propUrls: stage.props.map(p => assetUrl(`models/stages/props/${p}`)),
    },
    player: state.playerFighterId,
    opponent: state.opponentFighterId,
  };
}
