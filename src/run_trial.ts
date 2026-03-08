import {
  set_trial_context,
  type StimBank,
  type TaskSettings,
  type TrialBuilder,
  type TrialSnapshot
} from "psyflow-web";

function resolveFeedbackStim(snapshot: TrialSnapshot): "correct_feedback" | "incorrect_feedback" | "no_response_feedback" {
  const response = Boolean(snapshot.units.probe?.response);
  const hit = Boolean(snapshot.units.probe?.hit);
  if (response && hit) {
    return "correct_feedback";
  }
  if (response && !hit) {
    return "incorrect_feedback";
  }
  return "no_response_feedback";
}

export function run_trial(
  trial: TrialBuilder,
  condition: string,
  context: {
    settings: TaskSettings;
    stimBank: StimBank;
    block_idx: number;
  }
): TrialBuilder {
  const { settings, stimBank, block_idx } = context;
  const cueLetter = String(condition[0] ?? "");
  const probeLetter = String(condition[1] ?? "");
  const keyList = ((settings.key_list as string[]) ?? ["f", "j"]).map(String);
  const isTargetTrial = cueLetter === "A" && probeLetter === "X";
  const correctResponse = String(isTargetTrial ? settings.target_key ?? "f" : settings.nontarget_key ?? "j");

  trial.setTrialState("cue_letter", cueLetter);
  trial.setTrialState("probe_letter", probeLetter);
  trial.setTrialState("is_target_trial", isTargetTrial);
  trial.setTrialState("correct_response", correctResponse);

  trial
    .unit("fixation")
    .addStim(stimBank.get("fixation"))
    .show({ duration: Number(settings.fixation_duration ?? 0.5) })
    .to_dict();

  const cueStimId = `cue_${cueLetter}`;
  const cueUnit = trial.unit("cue").addStim(stimBank.get(cueStimId));
  set_trial_context(cueUnit, {
    trial_id: trial.trial_id,
    phase: "context_cue",
    deadline_s: Number(settings.cue_duration ?? 0.5),
    valid_keys: [...keyList],
    block_id: trial.block_id,
    condition_id: condition,
    task_factors: {
        condition,
        stage: "context_cue",
        cue_letter: cueLetter,
        probe_letter: probeLetter,
        block_idx
      },
    stim_id: cueStimId
  });
  cueUnit.show({ duration: Number(settings.cue_duration ?? 0.5) }).to_dict();

  const isiUnit = trial.unit("isi_fixation").addStim(stimBank.get("fixation"));
  set_trial_context(isiUnit, {
    trial_id: trial.trial_id,
    phase: "delay_fixation",
    deadline_s: Number(settings.isi_duration ?? 0.5),
    valid_keys: [...keyList],
    block_id: trial.block_id,
    condition_id: condition,
    task_factors: {
        condition,
        stage: "delay_fixation",
        cue_letter: cueLetter,
        probe_letter: probeLetter,
        block_idx
      },
    stim_id: "fixation"
  });
  isiUnit.show({ duration: Number(settings.isi_duration ?? 0.5) }).to_dict();

  const probeStimId = `probe_${probeLetter}`;
  const probeUnit = trial.unit("probe").addStim(stimBank.get(probeStimId));
  set_trial_context(probeUnit, {
    trial_id: trial.trial_id,
    phase: "probe_response",
    deadline_s: Number(settings.probe_duration ?? 1),
    valid_keys: [...keyList],
    block_id: trial.block_id,
    condition_id: condition,
    task_factors: {
      condition,
        stage: "probe_response",
        cue_letter: cueLetter,
        probe_letter: probeLetter,
        correct_key: correctResponse,
        block_idx
      },
    stim_id: probeStimId
  });
  probeUnit
    .captureResponse({
      keys: keyList,
      correct_keys: correctResponse,
      duration: Number(settings.probe_duration ?? 1),
      terminate_on_response: true
    })
    .to_dict();

  trial
    .unit("feedback")
    .addStim((snapshot: TrialSnapshot) => stimBank.get(resolveFeedbackStim(snapshot)))
    .show({ duration: Number(settings.feedback_duration ?? 0.5) })
    .set_state({
      feedback_type: (snapshot: TrialSnapshot) => resolveFeedbackStim(snapshot)
    })
    .to_dict();

  trial
    .unit("iti")
    .show({
      duration: (settings.iti_duration as number | number[] | null | undefined) ?? null
    })
    .to_dict();

  return trial;
}
