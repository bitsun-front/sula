import Select from './select';
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
  registerFieldPlugin('input')(Input);
  registerFieldPlugin('textarea')(Input.TextArea);
  registerFieldPlugin('password')(Input.Password);
  registerFieldPlugin('inputnumber')(InputNumber);
  registerFieldPlugin('rate')(Rate);
  registerFieldPlugin('switch')(Switch);
  registerFieldPlugin('checkbox')(Checkbox);
  registerFieldPlugin('radio')(Radio);
  registerFieldPlugin('slider')(Slider);

  registerFieldPlugin('cascader')(Cascader, true);
  registerFieldPlugin('treeselect')(TreeSelect, true);
  registerFieldPlugin('datepicker')(DatePicker);
  registerFieldPlugin('rangepicker')(RangePicker);
  registerFieldPlugin('timepicker')(TimePicker);
  registerFieldPlugin('upload')(Upload, false, true);
  registerFieldPlugin('select')(Select, true);
  registerFieldPlugin('checkboxgroup')(CheckboxGroup, true);
  registerFieldPlugin('radiogroup')(RadioGroup, true);

  registerFieldPlugin('editable')(Editable, false, true);

  //bitsun自定义插件
  registerFieldPlugin('bitsun-searchSelect')(BitSunSearchSelect, true, true);
  registerFieldPlugin('bitsun-tableField')(BitsunTableField, true, true);
  registerFieldPlugin('bitsun-numberRange')(BitsunNumberRange, true, true);
  registerFieldPlugin('bitsun-uploadList')(BitsunUploadList, true, true);
}

export { Select, CheckboxGroup, TimePicker, DatePicker, RangePicker, Cascader, TreeSelect, RadioGroup, Upload, registerFieldPlugins, registerFieldPlugin };
