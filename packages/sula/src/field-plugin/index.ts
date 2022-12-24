import Select from './select';
import SulaInput from './input';
import SulaTextArea from './textArea';
import SulaPassword from './password';
import SulaInputNumber from './inputNumber';
import Upload from './upload';
import Cascader from './cascader';
import TreeSelect from './treeselect';
import CheckboxGroup from './checkboxgroup';
import RadioGroup from './radiogroup';
import DatePicker from './datepicker';
import RangePicker from './rangepicker';
import TimePicker from './timepicker';

// list
import Editable from './editable';
import BitSunSearchSelect from './bsFieldPlugin/bsSearchSelect';
import BitsunTableField from './bsFieldPlugin/bsTableField';
import BitsunNumberRange from './bsFieldPlugin/bsNumberRange';
import BitsunUploadList from './bsFieldPlugin/bsUploadList';

import { registerFieldPlugin } from './plugin';
import { Switch, Checkbox, Input, InputNumber, Rate, Radio, Slider } from 'antd';

function registerFieldPlugins() {
  registerFieldPlugin('input')(SulaInput, true, true);
  registerFieldPlugin('textarea')(SulaTextArea, true, true);
  registerFieldPlugin('password')(SulaPassword, true, true);
  registerFieldPlugin('inputnumber')(SulaInputNumber, true, true);
  registerFieldPlugin('rate')(Rate);
  registerFieldPlugin('switch')(Switch);
  registerFieldPlugin('checkbox')(Checkbox);
  registerFieldPlugin('radio')(Radio);
  registerFieldPlugin('slider')(Slider);

  registerFieldPlugin('cascader')(Cascader, true, true);
  registerFieldPlugin('treeselect')(TreeSelect, true, true);
  registerFieldPlugin('datepicker')(DatePicker, true, true);
  registerFieldPlugin('rangepicker')(RangePicker, true, true);
  registerFieldPlugin('timepicker')(TimePicker, true, true);
  registerFieldPlugin('upload')(Upload, false, true);
  registerFieldPlugin('select')(Select, true, true);
  registerFieldPlugin('checkboxgroup')(CheckboxGroup, true,true);
  registerFieldPlugin('radiogroup')(RadioGroup, true,true);

  registerFieldPlugin('editable')(Editable, false, true);

  //bitsun自定义插件
  registerFieldPlugin('bitsun-searchSelect')(BitSunSearchSelect, true, true);
  registerFieldPlugin('bitsun-tableField')(BitsunTableField, true, true);
  registerFieldPlugin('bitsun-numberRange')(BitsunNumberRange, true, true);
  registerFieldPlugin('bitsun-uploadList')(BitsunUploadList, true, true);
}

export { Select, CheckboxGroup, TimePicker, DatePicker, RangePicker, Cascader, TreeSelect, RadioGroup, Upload, registerFieldPlugins, registerFieldPlugin };
