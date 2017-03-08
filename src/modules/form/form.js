require('selectize');
var styles = require('../../js/styles');

if (!window.CATALOG_URL) throw new Error('CATALOG_URL not found.');

var parentage = {
  brand: 'model',
  model: 'generation'
};

var selectizeConfig = {
  allowEmptyOption: true,
  labelField:       'title',
  valueField:       'title',
  searchField:      ['title'],
  sortField:        'title',
  onChange:         function (value) {
    var type = this.$input.data('type');
    var child = parentage[type];
    if (!child) return;

    var form = this.$wrapper.parents('form');
    var $child = form.find('[data-type="' + child + '"]');
    if (!$child.length) return;
    $child[0].selectize.load(function (cb) {
      $.get(CATALOG_URL[type], {parent: value}, cb);
    })
  }
};

$('.' + styles.form.form).on('submit', function () {
  var $form = $(this);
  var $popup = $("#request");
  var fields = getForm($form);
  $popup.find('.' + styles.popup.selected).text(formatText(fields));
  for (var key in fields) {
    $popup.find('[name="' + key + '"]').val(fields[key]);
  }
  $.magnificPopup.open({
    items: {
      type: 'inline',
      src:  '#request'
    }
  });
  return false;
});

$('.' + styles.form.select).selectize(selectizeConfig);

$.get(CATALOG_URL.brand, function (res) {
  $('.' + styles.form.select + '[data-type="brand"]').each(function () {
    this.selectize.load(function (cb) {
      cb(res);
    })
  })
});

$.get(CATALOG_URL.body, function (res) {
  $('.' + styles.form.select + '[data-type="body"]').each(function () {
    this.selectize.load(function (cb) {
      cb(res);
    })
  })
});

function getForm ($form) {
  var fields = $form.serializeArray();
  var res = {};
  for (var i = 0; i < fields.length; i++) {
    res[fields[i].name] = fields[i].value;
  }
  return res;
}

function formatText (form) {
  if ($.isEmptyObject(form)) return '';
  var text = 'Вы выбрали: ';
  if (form.count) text += form.count;
  if (form.brand || form.model || form.generation || form.body) text += ' на ';
  if (form.brand) text += form.brand + ' ';
  if (form.model) text += form.model + ' ';
  if (form.generation) text += form.generation + ' ';
  if (form.body) text += form.body;
  return text;
}