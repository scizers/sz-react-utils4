// import moment from 'moment'
import React, { Component, PureComponent } from 'react'

import ReactQuill from 'react-quill' // ES6
import 'react-quill/dist/quill.snow.css' // ES6
import 'react-quill/dist/quill.bubble.css' // ES6

import {
  Form,
  Input,
  Upload,
  Icon,
  Button,
  InputNumber,
  Select,
  DatePicker,
  Spin,
  Switch,
  Radio,
  Modal,
} from 'antd'

import isEqual from 'lodash/isEqual'
import S from 'string'

const RadioGroup = Radio.Group

const Option = Select.Option
const {TextArea} = Input

const styles = {
  mainDiv: {
    position: 'relative',
  },
  loadingBox: {
    position: 'absolute',
    top: 0,
    left: 0,
    height: '100%',
    width: '100%',
    backgroundColor: 'rgba(255, 255,255, 0.5)',
    textAlign: 'center',
    paddingTop: '10%',

  },
}

function getBase64 (file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => resolve(reader.result)
    reader.onerror = error => reject(error)
  })
}

class SimpleFormElement extends PureComponent {

  state = {
    tempFiles: [],
    previewImage: null,
    previewVisible: false,
  }

  handleCancel = () => this.setState({previewVisible: false})

  handlePreview = async file => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj)
    }

    this.setState({
      previewImage: file.url || file.preview,
      previewVisible: true,
    })
  }

  handleChange = ({fileList}) => this.setState({fileList})

  section = (type) => {

    let x = this.props
    let {item, apiurl} = this.props

    switch (type) {
      case 'number':
        return <InputNumber {...x} {...item} />

      case 'customNumber':
        delete item.type
        return <InputNumber {...item}/>

      case 'date':
        return <DatePicker {...x} format={item.format}/>

      case 'textArea':
      case 'textarea':
        return <TextArea {...x} rows={x.rows} {...item} />

      case 'editor':
        return <ReactQuill  {...x} />

      case 'file':

        let limit = 1
        if (!!item.limit) limit = item.limit

        let {fileList, item: {key, photos, updateDisable}} = x

        let uploadEnable = true
        if (fileList !== undefined) {
          if (fileList.length >= limit) {
            uploadEnable = false
          }
        }

        let listTypeProps = {}
        let uploadButton = <Button><Icon type='upload'/> Select File</Button>

        if (photos) {
          listTypeProps = {
            listType: 'picture-card',
            onPreview: this.handlePreview,
            onChange: this.handleChange,
          }
          uploadButton = (<div>
            <Icon type="plus"/>
            <div className="ant-upload-text">Upload</div>
          </div>)
        }

        return (
          <React.Fragment>
            <Upload
              name={'file'}
              {...listTypeProps}

              action={`${apiurl}/filesUploader`}
              defaultFileList={item.defaultFileList}
              showUploadList={{
                showPreviewIcon: true,
                showRemoveIcon: !updateDisable,
              }}
              {...x}
            >
              {uploadEnable && !updateDisable && (uploadButton)}

            </Upload>
            <Modal visible={this.state.previewVisible} footer={null}
                   onCancel={this.handleCancel}>
              <img alt="example" style={{width: '100%'}}
                   src={this.state.previewImage}/>
            </Modal>

          </React.Fragment>
        )

      case 'switch':
        let extra = {
          defaultChecked: !!item.defaultValue,
          size: item.size !== undefined ? item.size : 'small',
        }
        return <Switch {...extra} {...x} onChange={x.item.onChange}/>

      case 'select':

        if (!x.options) x.options = []
        if (!x.item.defaultValue) x.item.defaultValue = {'key': 'Please Select'}
        return <SelectDynamicComp {...x}/>

      case 'radioGroup':
        if (!x.options) x.options = []
        //if (!x.item.defaultValue) x.item.defaultValue = { 'key': 'Please Select' }

        if (x.mode === 'solid') {
          return <RadioGroup {...item} {...x} options={x.options} onChange={x.item.onChange}/>
        }

        return <RadioGroup {...item} {...x} options={x.options} onChange={x.item.onChange}/>

      default:

        return <Input   {...x}/>
    }
  }

  render () {
    const {item} = this.props

    const {type} = item
    return (
      <React.Fragment>
        {this.section(type)}
      </React.Fragment>
    )
  }

}

class SelectDynamicComp extends Component {
  render () {

    let x = this.props

    if (!x.item.showSearch) x.item.showSearch = false
    if (!x.item.disabled) x.item.disabled = false
    let options = x.item.options

    let keyAccessor = x.keyAccessor ? x.keyAccessor : val => val.id ? val.id : val._id
    let valueAccessor = x.valueAccessor ? x.valueAccessor : val => val.display

    return (<Select
      placeholder={x.item.placeholder ? x.item.placeholder : `${x.item.label}`}
      showSearch={x.item.showSearch}
      onChange={x.item.onChange}
      disabled={x.item.disabled}
      filterOption={(input, option) => {
        return option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
      }}
      mode={x.item.mode}
    >


      {options.map((val, index) => {

        if (typeof val === 'object') {
          return (
            <Option key={index} value={keyAccessor(val)}>{valueAccessor(val)}</Option>
          )
        } else {
          return (
            <Option key={index} value={val}>{val}</Option>
          )
        }

      })}
    </Select>)

    /*return (<Select>

      <Option key={moment().unix()} value={'dd'}>test</Option>

    </Select>)*/

  }
}

class SelectAsync extends PureComponent {
  render () {
    const options = this.state.data.map(d => (
      <Option key={d.value}>{d.text}</Option>
    ))
    return (
      <Select
        showSearch
        placeholder={this.props.placeholder}
        style={this.props.style}
        defaultActiveFirstOption={false}
        showArrow={true}
        filterOption={true}
        onSearch={this.handleSearch}
        onChange={this.handleChange}
        notFoundContent={null}
      >
        {options}
      </Select>
    )
  }

}

class getAllFormFields extends Component {

  state = {
    fileUploads: [],
  }

  normFile = (e, name) => {
    if (Array.isArray(e)) {
      return e
    }
    let fileUploads = this.state.fileUploads
    fileUploads[name] = e.fileList
    this.setState({fileUploads})
    return e && e.fileList
  }
  updateUploadState = (key) => {

    const {getFieldValue} = this.props

    if (!getFieldValue) return false

    let xx = getFieldValue(key)

    if (xx) {
      let fileUploads = this.state.fileUploads

      if (!isEqual(xx, fileUploads[key])) {
        fileUploads[key] = xx

        setTimeout(() => {
          this.setState({fileUploads})
        }, 30)

      }

    }
  }

  constructor (props) {
    super(props)

  }

  render () {

    const {inputSchema, getFieldDecorator, children, formItemLayout, apiurl} = this.props

    let FIL = {}

    if (!formItemLayout) {
      FIL = {
        labelCol: {
          xs: {span: 24},
          sm: {span: 8},
          md: {span: 8},
        },
        wrapperCol: {
          xs: {span: 24},
          sm: {span: 16},
          md: {span: 12},
        },
      }
    } else {
      FIL = formItemLayout
    }

    return (
      <div style={styles.mainDiv}>

        {inputSchema.fields.map((item) => {

          let rules = []
          if (item.required) {
            rules.push({
              required: true,
              message: item.requiredMessage ? item.requiredMessage : 'This is a Mandatory Field',
            })

          }

          if (item.label === undefined) {
            item.label = S(item.key).humanize().titleCase().s
          }

          let customEvent = {}
          if (item.customDirectives) {
            customEvent = item.customDirectives
          }

          let inputProps = {}

          if (!!item.placeholder) inputProps.placeholder = item.placeholder
          if (!!apiurl) inputProps.apiurl = apiurl

          if (!!item.options) {
            inputProps.options = item.options
          } else {
            inputProps.options = ['Choose']
          }

          if (!!item.type) inputProps.type = item.type
          if (!!item.mode) inputProps.mode = item.mode
          if (!!item.rows) inputProps.rows = item.rows
          if (!!item.keyAccessor) inputProps.keyAccessor = item.keyAccessor
          if (!!item.valueAccessor) inputProps.valueAccessor = item.valueAccessor

          if (this.onChange) {
            customEvent = {
              ...customEvent,
              getValueFromEvent: this.onChange,
            }
          }

          if (item.type === 'file') {

            customEvent = {
              ...customEvent,
              valuePropName: 'fileList',
              getValueFromEvent: (e) => {
                return this.normFile(e, item.key)
              },
            }

            inputProps = {
              ...inputProps,
              fileUploads: this.state.fileUploads,
              trigger: 'onBlur',
            }

            this.updateUploadState(item.key)
          }

          if (item.type === 'editor') {
            customEvent = {
              ...customEvent,
              initialValue: item.initialValue ? item.initialValue : '',
              valuePropName: 'value',
              getValueFromEvent: this.onChange,
            }

          }

          if (item.type === 'ckeditor') {
            customEvent = {
              ...customEvent,
              // initialValue: item.initialValue ? item.initialValue : '',
              valuePropName: 'data',
              getValueFromEvent: (event, editor) => {
                const data = editor.getData()
                return data
              },
            }

          }

          if (item.type === 'customNumber') {
            customEvent = {
              ...customEvent,
              defaultValue: item.defaultValue ? item.defaultValue : '',
              valuePropName: 'value',
              getValueFromEvent: this.onChange,
            }

          }

          if (item.type === 'switch') {
            customEvent = {
              ...customEvent,
              valuePropName: 'checked',
            }
          }

          inputProps = {
            ...inputProps,
            ...item.customProps,

          }

          return (
            <React.Fragment key={item.key}>


              {!item.hidden &&
              <React.Fragment>
                {/*{item.prefixComp ? item.prefixComp : null}*/}
                <Form.Item name={item.key}
                           label={item.label}
                           rules={rules}
                >

                  <SimpleFormElement
                    item={item}   {...inputProps}/>

                  {/*{item.rightComp ? item.rightComp : null}*/}
                </Form.Item>
              </React.Fragment>}

            </React.Fragment>
          )

        })}

        {children}

        {this.props.loading ? (<div style={styles.loadingBox}>
          <Spin size="large"/>
        </div>) : null}

      </div>
    )

  }

}

export default (getAllFormFields)
