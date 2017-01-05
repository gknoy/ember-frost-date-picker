import Ember from 'ember'
import PikadayOptions from '../utils/pikaday-options'
import FrostText from 'ember-frost-core/components/frost-text'
import PropTypeMixin, {PropTypes} from 'ember-prop-types'
import SpreadMixin from 'ember-spread'
import layout from '../templates/components/frost-date-picker'

const {
  run,
  merge,
  computed
} = Ember

const {
  moment,
  Pikaday
} = window

export default FrostText.extend(SpreadMixin, PropTypeMixin, {
  layout,
  // == Pikaday Options ===========
  propTypes: {
    options: PropTypes.object,
    format: PropTypes.string,
    theme: PropTypes.string,
    onSelect: PropTypes.func,
    onOpen: PropTypes.func,
    onClose: PropTypes.func,
    onDraw: PropTypes.func,
    hideIcon: PropTypes.bool
  },
  field: computed(function () {
    return this.$('input')[0]
  }),
  didInsertElement () {
    this._super(...arguments)
    run.schedule('sync', this, function () {
      this.set(
        'value',
        this.get('value') || moment().format(this.get('format'))
      )
      let options = {}
      let _assign = (el, value, type) => {
        if (value) {
          if (type === 'callback') {
            options[el] = run.bind(this, value)
          } else {
            options[el] = value
          }
        }
      }
      PikadayOptions.forEach(v => {
        switch (typeof v) {
          case 'object':
            _assign(v.label, this.get(v.ref), v.type)
            break
          case 'string':
            _assign(v, this.get(v))
        }
      })
      options['onSelect'] = run.bind(this, this.actions._onSelect)
      this.set(
        'el',
        new Pikaday(merge(this.get('options'), options))
      )
    })
  },
  willDestroyElement () {
    this._super(...arguments)
    this.get('el').destroy()
  },
  getDefaultProps () {
    return {
      options: {},
      format: 'YYYY-MM-DD',
      theme: 'frost-theme',
      hideIcon: false
    }
  },
  actions: {
    _onSelect (date) {
      const onSelect = this.get('onSelect')
      let result = undefined
      let el = this.get('el')
      if (onSelect) {
        result = onSelect(el.toString())
      }
      this.set('value', result || el.toString())
    },
    _onKeyPress (e) {
      if (e.keyCode === 13) {
        let v = this.$('input').val()
        if (moment(v).isValid()) {
          this.set('field.value', v)
        } else {
          if (this.get('onError')) {
            this.get('onError').call(this, v)
          }
          let d = moment(this.get('el').getDate())
          this.set('field.value', d.format(this.get('format')))
        }
      }
    }
  }
})
