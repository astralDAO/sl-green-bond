import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import * as contractActionCreators from 'core/actions/actions-contract'
import * as uiActionCreators from 'core/actions/actions-ui'
import {
  Box,
  Button,
  Flex,
  Loader
} from 'rimble-ui'
import TransactionSummary from './components/Transactions/TransactionSummary'
import TransactionStarted from './components/Transactions/TransactionStarted'
import TransactionSuccess from './components/Transactions/TransactionSuccess'
import { styles } from './styles.scss'

class PayDebtsView extends Component {
  constructor(props) {
    super(props)

    this.state = { timer: '' }
  }
  componentDidMount() {
    const { actions } = this.props
    actions.contract.getTotalDebtOwed()
    setTimeout(() => {
      this.setState({ timer: 'expired' })
    }, 2000)
  }

  componentDidUpdate(prevProps) {
    if (prevProps.transaction.txHash !== this.props.transaction.txHash) {
      this.onSuccess()
    }
  }

  onConfirm = () => {
    const { actions } = this.props
    actions.ui.closeModal({ modalKey: 'pay-debt-transaction-summary' })
    actions.ui.openModal({ modalKey: 'pay-debt-transaction-started' })
  }

  onSuccess = () => {
    const { actions } = this.props
    actions.ui.closeModal({ modalKey: 'pay-debt-transaction-started' })
    actions.ui.openModal({ modalKey: 'pay-debt-transaction-success' })
  }

  payTotalDebt = async () => {
    const { actions } = this.props
    actions.ui.openModal({ modalKey: 'pay-debt-transaction-summary' })
    await actions.contract.payTotalDebt()
    this.onConfirm()
  }

  displayTotalDebtOwed = () => {
    const { contract } = this.props
    const { timer } = this.state

    if (contract.totalDebtOwed !== null && (timer === 'expired')) {
      return (
        <div>
          <span>Total Debt Owed: <strong>{contract.totalDebtOwed} ETH</strong></span>
          <Box id="pay-debt-btn" px={3}>
            <Button onClick={this.payTotalDebt}>Pay Total Debt Now</Button>
          </Box>
        </div>
      )
    }

    return (
      <div>
        <span>Calculating Total Debt Owed...</span>
        <Loader id="loader" size="40px" />
      </div>
    )
  }

  render() {
    return (
      <div className={styles}>
        <div className="container">
          <h2>Pay Outstanding Debts</h2>
          <Box>
            <Flex mx={-3} flexWrap="wrap">
              <Box id="debt-amount-display" px={3}>
                {this.displayTotalDebtOwed()}
              </Box>
            </Flex>
          </Box>
        </div>
        <TransactionSummary />
        <TransactionStarted />
        <TransactionSuccess />
      </div>
    )
  }
}

function mapStateToProps(state) {
  return {
    contract: state.contract,
    transaction: state.transaction
  }
}

function mapDispatchToProps(dispatch) {
  return {
    actions: {
      contract: bindActionCreators(contractActionCreators, dispatch),
      ui: bindActionCreators(uiActionCreators, dispatch)
    }
  }
}

PayDebtsView.propTypes = {
  contract: PropTypes.shape({
    totalDebtOwed: PropTypes.number,
    getTotalDebtOwed: PropTypes.func
  }).isRequired,
  transaction: PropTypes.shape({
    txHash: PropTypes.string
  }).isRequired
}

export default connect(mapStateToProps, mapDispatchToProps)(PayDebtsView)
