import { tpmQuestions } from "./tpm.questions.js";
import { gcmQuestions } from "./gcm.questions.js";
import { cincoSQuestions } from "./cincoS.questions.js";
import { gaQuestions } from "./ga.questions.js";
import { meQuestions } from "./me.questions.js";
import { etQuestions } from "./et.questions.js";
import { mpQuestions } from "./mp.questions.js";
import { mqQuestions } from "./mq.questions.js";
import { ssoQuestions } from "./sso.questions.js";
import { maQuestions } from "./ma.questions.js";
import { ciQuestions } from "./ci.questions.js";

export const questionsSeed = [
  ...tpmQuestions,
  ...gcmQuestions,
  ...cincoSQuestions,
  ...gaQuestions,
  ...meQuestions,
  ...etQuestions,
  ...mpQuestions,
  ...mqQuestions,
  ...ssoQuestions,
  ...maQuestions,
  ...ciQuestions,
];

export const questionsCountByTheme = {
  "TPM": tpmQuestions.length,
  "GCM": gcmQuestions.length,
  "5S": cincoSQuestions.length,
  "GA - Gestão Autônoma": gaQuestions.length,
  "ME - Melhoria Específica": meQuestions.length,
  "ET - Educação e Treinamento": etQuestions.length,
  "MP - Manutenção Planejada": mpQuestions.length,
  "MQ - Manutenção da Qualidade": mqQuestions.length,
  "SSO": ssoQuestions.length,
  "MA - Meio Ambiente": maQuestions.length,
  "CI / TPM Office": ciQuestions.length,
};
