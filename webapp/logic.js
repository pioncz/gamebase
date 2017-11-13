import { parseLogic } from './services/redux-commons'
import { logic as apiLogic } from './shared/redux/api'

export default parseLogic({
  ...apiLogic,
});
