import React, { Component } from 'react'
import { Button, DatePicker, Input, Table, Select, Spin } from 'antd'
import { SearchOutlined, FilterOutlined } from '@ant-design/icons'

import isEqual from 'lodash/isEqual'
import clone from 'lodash/clone'
import each from 'lodash/each'
import map from 'lodash/map'
// import find from 'lodash/find'
import filter from 'lodash/filter'

import memoizeOne from 'memoize-one'
import S from 'string'

const {Option} = Select

const {MonthPicker, RangePicker, WeekPicker} = DatePicker

class TableMain extends Component {

  state = {
    data: [],
    size: 'small',
    columns: [],
    pagination: {},
    loading: true,
    searchText: '',
    withoutLoader: false,
    dataSearchParams: {},
    dateFilters: {},
  }

  handleTableChange = (pagination, filters, sorter) => {
    const pager = {...this.state.pagination}
    pager.current = pagination.current
    this.setState({
      pagination: pager,
    })
    this.fetch2({
      results: pagination.pageSize,
      page: pagination.current,
      sortField: sorter.field,
      sortOrder: sorter.order,
      ...filters,
    })
  }

  fetch = async (params = {}) => {

    const {withoutLoader} = this.state

    let loading = true
    if (withoutLoader) {
      loading = false
    }

    this.setState({
      loading,
      dataSearchParams: params,
    })

    params.count = params.results

    for (let x in params) {
      if (params[x] === null) {
        delete params[x]
      }
    }

    let data = await this.props.apiRequest({...params})

    let pagination = {...this.state.pagination}
    pagination.total = data.total
    this.setState({
      loading: false,
      data: data.data,
      pagination,
    })

  }

  getColumnSearchProps = (dataIndex) => ({
    filterDropdown: (pro) => {
      let {
        setSelectedKeys,
        selectedKeys,
        confirm,
        clearFilters,
      } = pro

      return (<div
        id={`filter-${dataIndex}`}
        className={`filter-${dataIndex}`}
        style={{
          padding: '8px',
          borderRadius: '4px',
          backgroundColor: '#ffffff',
          boxShadow: '0 2px 8px rgba(0, 0, 0, .15)',
          test: '100',
        }}>
        <Input
          ref={node => {
            this.searchInput = node
          }}
          className={'searchInput'}
          placeholder={`Search ${dataIndex}`}
          value={selectedKeys[0]}
          onChange={e => setSelectedKeys(
            e.target.value ? [e.target.value] : [])}
          onPressEnter={(e) => {
            return this.handleSearch(selectedKeys, confirm)
          }}
          style={{width: 188, marginBottom: 8, display: 'block'}}
        />

        <Button
          className={'search'}
          type="primary"
          onClick={() => this.handleSearch(selectedKeys, confirm)}
          icon={<SearchOutlined/>}
          size="small"
          style={{width: 90, marginRight: 8}}
        >
          Search
        </Button>

        <Button
          className={'reset'}
          onClick={() => {
            this.handleReset(clearFilters, confirm)
          }}
          size="small"
          style={{width: 90}}
        >
          Reset
        </Button>
      </div>)
    },
    filterIcon: filtered => <SearchOutlined id={`searchIcon-${dataIndex}`}
                                            style={{color: filtered ? '#1890ff' : undefined}}/>,
    onFilterDropdownVisibleChange: (visible) => {
      if (visible) {
        setTimeout(() => this.searchInput.select())
      }
    },
    render: (text) => {
      return (
        <React.Fragment>{text}</React.Fragment>
      )
    },
  })

  getColumnDateSearchProps = (dataIndex) => ({
    filterDropdown: (pro) => {

      let {
        setSelectedKeys,
        selectedKeys,
        confirm,
        clearFilters,
      } = pro

      return (<div
        className={`filter-${dataIndex}`}
        style={{
          padding: '8px',
          borderRadius: '4px',
          backgroundColor: '#ffffff',
          boxShadow: '0 2px 8px rgba(0, 0, 0, .15)',
          test: '100',
        }}>

        <RangePicker
          className={'rangePicker'}
          style={{width: 250, marginBottom: 8, display: 'block'}}
          ref={node => {
            this.searchInput = node
          }}

          onChange={(date) => {
            setSelectedKeys(date)

            //  setSelectedKeys({
            //    $gte: date[0].startOf('day').toDate(),
            //    $lt: date[1].endOf('day').toDate(),
            //  })

          }}/>

        <div style={{flex: 1, justifyContent: 'flex-end'}}>
          <Button
            type="primary"
            className={'search'}
            onClick={() => {

              let dateFilters = clone(this.state.dateFilters)
              dateFilters[dataIndex] = true
              this.setState({
                dateFilters,
              }, () => {

                confirm()
              })

              //  let choosenDate = clone(pro.selectedKeys)

              // let  dateFilters={
              //      $gte:choosenDate[0].startOf('day').toDate(),
              //      $lte:choosenDate[1].startOf('end').toDate(),
              //  }
              //  // let dateFilters = clone(this.state.dateFilters)
              //   dateFilters[dataIndex] = true

              //   console.log(choosenDate)
              //   console.log("====")
              //   console.log(dateFilters)
              //   this.setState({
              //     dateFilters,
              //   })

              //   confirm()
            }}
            icon={<SearchOutlined/>}
            size="small"
            style={{width: 90, marginRight: 8}}
          >
            Search
          </Button>
          <Button
            className={'reset'}
            onClick={() => {
              let dateFilters = clone(this.state.dateFilters)
              dateFilters[dataIndex] = false
              this.setState({
                dateFilters,
              })
              clearFilters()
            }}
            size="small"
            style={{width: 90}}
          >
            Reset
          </Button>
        </div>

      </div>)
    },
    filterIcon: x => {
      let {dateFilters} = this.state
      let filtered = dateFilters && dateFilters[dataIndex]
      return <SearchOutlined type="search" id={`searchIcon-${dataIndex}`}
                             style={{color: filtered ? '#1890ff' : undefined}}/>
    },
    onFilterDropdownVisibleChange: (visible) => {
      if (visible) {
        setTimeout(() => this.searchInput.focus())
      }
    },
  })

  handleSearch = (selectedKeys, confirm) => {

    this.setState({searchText: selectedKeys[0]}, () => {
      setTimeout(() => {
        confirm()
      }, 100)
    })

  }

  handleReset = (clearFilters, confirm) => {
    this.setState({searchText: ''})
    setTimeout(() => {
      clearFilters()
    }, 100)

    setTimeout(() => {
      confirm()
    }, 200)
  }

  reload = (withoutLoader) => {

    this.setState({
      withoutLoader: !!withoutLoader,
    })

    let {apiRequest} = this.props
    if (!!apiRequest) {
      this.fetch(this.state.dataSearchParams)
    }
  }

  setDataState = async () => {

  }
  onRowSelectChange = (selectedRowKeys, selectedRows) => {
    this.setState({selectedRowKeys, selectedRows}, () => {
      const {checkBox} = this.props
      checkBox({selectedRowKeys, selectedRows})
    })
  }
  handleChange = (value) => {
    // console.log(value, "jdgfhngjhdg");
    localStorage.setItem(this.props.id, JSON.stringify(value))
    this.reload()
  }

  constructor (props) {
    super(props)
    this.fetch2 = memoizeOne(this.fetch)
  }

  componentDidUpdate (prevProps) {
    if (!isEqual(this.props.columns, prevProps.columns)) {

      let x = []
      each(this.props.columns, i => {
        if (i.searchTextName) {
          i = {...this.getColumnSearchProps(i.searchTextName), ...i}
        }

        if (i.searchDateName) {
          i = {...this.getColumnDateSearchProps(i.searchDateName), ...i}
        }

        if (i.filters) {
          let x = {
            filterIcon: filtered => <FilterOutlined id={`searchIcon-${i.dataIndex}`} type={'filter'}
                                                    style={{color: filtered ? '#1890ff' : undefined}}/>,
          }

          i = {...x, ...i}
        }

        if (
          i.dataIndex === undefined &&
          i.key !== 'actions' &&
          i.type !== 'actions'
        ) {
          i.dataIndex = i.key
        }

        if (i.title === undefined) {
          i.title = S(i.dataIndex).humanize().titleCase().s
        }
        x.push(i)
      })

      this.setState({
        columns: x,
      })

    }
  }

  componentDidMount () {

    let {pagination, apiRequest, selectedRowKeys} = this.props

    if (!pagination) {
      pagination = {
        defaultPageSize: 10,
      }
    }

    let x = []
    each(this.props.columns, (i) => {

      if (i.searchTextName) {
        i = {...this.getColumnSearchProps(i.searchTextName), ...i}
      }

      if (i.searchDateName) {
        i = {...this.getColumnDateSearchProps(i.searchDateName), ...i}
      }

      if (i.dataIndex === undefined && i.key !== 'actions' && i.type !==
        'actions') {
        i.dataIndex = i.key
      }

      if (i.title === undefined) {
        i.title = S(i.dataIndex).humanize().titleCase().s
      }
      x.push(i)

    })

    if (selectedRowKeys) {
      this.setState({
        selectedRowKeys,
      })
    }

    this.setState({
      columns: x,
    })

    if (!!apiRequest) {
      this.fetch2({
        results: pagination.defaultPageSize,
      })
    }

  }

  renderDynamic () {
    let {columns, selectedRowKeys, selectedRows} = this.state
    const {extraProps, reloadButon, rowKey, checkBox, id, showSelector} = this.props
    const rowSelection = {
      selectedRowKeys,
      selectedRows,
      onChange: this.onRowSelectChange,
    }

    const columnsName = map(columns, x => ({key: x.key, title: x.title}))

    let all = []

    each(columns, x => {
      all.push(x.key)
    })

    let def = localStorage.getItem(this.props.id)
    if (def) {
      all = JSON.parse(def)
    }

    columns = filter(columns, (x) => {
      return all.indexOf(x.key) !== -1
    })

    const tableLoading = {
      spinning: this.state.loading,
      indicator: <div className={'myspinner'}
                      style={{width: '300px', left: 'calc(50% - 150px)'}}>
        <Spin size={'large'}/>
        <p style={{
          margin: 0,
          padding: 0,
          lineHeight: '20px',
          marginTop: '15px',
        }}>processing data</p>
        <p style={{fontSize: '14px'}}>please give us a second</p>
      </div>,
    }

    return (
      <React.Fragment>

        <div style={{marginBottom: 10}}>
          {reloadButon ?
           <Button
             shape="circle" onClick={() => {
             this.reload()
           }} icon="reload"/> : null}
        </div>

        {(showSelector && id) &&
        <div style={{textAlign: 'right', marginBottom: '13px'}}>
          <Select
            mode="multiple"
            maxTagTextLength={10}
            maxTagCount={0}
            style={{width: '10%'}}
            placeholder="select columns"
            defaultValue={all}
            onChange={this.handleChange}
            optionLabelProp="label"
          >

            {columnsName.map((x) => (<Option value={x.key} label={x.title}>
              {x.title}
            </Option>))}

          </Select>
        </div>}

        <Table
          id={id || 'datatable'}
          bordered
          {...extraProps}
          rowSelection={checkBox && rowSelection}
          columns={columns}
          rowKey={rowKey ? rowKey : record => record._id}
          size={this.state.size}
          dataSource={this.state.data}
          pagination={{
            ...this.state.pagination,
            defaultPageSize: 10,
            pageSizeOptions: ['10', '25', '50', '100'],
            showSizeChanger: true,
            ...this.props.pagination,
          }}
          onChange={this.handleTableChange}
          loading={tableLoading}
        />

      </React.Fragment>
    )
  }

  renderStatic () {
    const {columns, selectedRowKeys, selectedRows} = this.state
    const {extraProps, dataSource, reloadButon, rowKey, checkBox, id} = this.props
    const rowSelection = {
      selectedRowKeys,
      selectedRows,
      onChange: this.onRowSelectChange,
    }
    return (
      <React.Fragment>

        <div style={{marginBottom: 10}}>
          {reloadButon ?
           <Button
             shape="circle" onClick={() => {
             this.reload()
           }} icon="reload"/> : null}
        </div>

        <Table
          bordered
          id={id || 'datatable'}
          {...extraProps}
          columns={columns}
          rowSelection={checkBox && rowSelection}
          rowKey={rowKey ? rowKey : record => record._id}
          size={this.state.size}
          dataSource={dataSource}
          pagination={{
            ...this.state.pagination,
            defaultPageSize: 10,
            pageSizeOptions: ['10', '25', '50', '100'],
            showSizeChanger: true,
            ...this.props.pagination,
          }}
          onChange={() => {

          }}
          loading={this.props.loading}
        />

      </React.Fragment>
    )
  }

  render () {

    const {apiRequest} = this.props

    return (
      <React.Fragment>{!!apiRequest
                       ? this.renderDynamic()
                       : this.renderStatic()}</React.Fragment>
    )
  }

}

export default TableMain
