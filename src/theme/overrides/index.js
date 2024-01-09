import merge from 'lodash/merge';

//
import Fab from './components/fab';
import Link from './components/link';
import Tabs from './components/tabs';
import Card from './components/card';
import Chip from './components/chip';
import Menu from './components/menu';
import Lists from './components/list';
import Stack from './components/stack';
import Badge from './components/badge';
import Table from './components/table';
import Alert from './components/alert';
import Paper from './components/paper';
import Switch from './components/switch';
import Slider from './components/slider';
import Avatar from './components/avatar';
import Drawer from './components/drawer';
import AppBar from './components/appbar';
import Dialog from './components/dialog';
import Rating from './components/rating';
import Button from './components/button';
import Select from './components/select';
import Stepper from './components/stepper';
import Tooltip from './components/tooltip';
import Popover from './components/popover';
import SvgIcon from './components/svg-icon';
import Checkbox from './components/checkbox';
import Progress from './components/progress';
import Skeleton from './components/skeleton';
import Backdrop from './components/backdrop';
import Timeline from './components/timeline';
import TreeView from './components/tree-view';
import DataGrid from './components/data-grid';
import Accordion from './components/accordion';
import TextField from './components/textfield';
import Pagination from './components/pagination';
import Typography from './components/typography';
import Breadcrumbs from './components/breadcrumbs';
import ButtonGroup from './components/button-group';
import CssBaseline from './components/css-baseline';
import RadioButton from './components/radio-button';
import MuiDatePicker from './components/date-picker';
import Autocomplete from './components/autocomplete';
import ToggleButton from './components/toggle-button';
import LoadingButton from './components/loading-button';

// ----------------------------------------------------------------------

export function componentsOverrides(theme) {
  const components = merge(
    Fab(theme),
    Tabs(theme),
    Chip(theme),
    Card(theme),
    Menu(theme),
    Link(theme),
    Stack(theme),
    Badge(theme),
    Lists(theme),
    Table(theme),
    Paper(theme),
    Alert(theme),
    Switch(theme),
    Select(theme),
    Button(theme),
    Rating(theme),
    Dialog(theme),
    AppBar(theme),
    Avatar(theme),
    Slider(theme),
    Drawer(theme),
    Stepper(theme),
    Tooltip(theme),
    Popover(theme),
    SvgIcon(theme),
    Checkbox(theme),
    DataGrid(theme),
    Skeleton(theme),
    Timeline(theme),
    TreeView(theme),
    Backdrop(theme),
    Progress(theme),
    TextField(theme),
    Accordion(theme),
    Typography(theme),
    Pagination(theme),
    RadioButton(theme),
    ButtonGroup(theme),
    Breadcrumbs(theme),
    CssBaseline(theme),
    Autocomplete(theme),
    ToggleButton(theme),
    MuiDatePicker(theme),
    LoadingButton(theme)
  );

  return components;
}
