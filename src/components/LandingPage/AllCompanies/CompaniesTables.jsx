import React from 'react'
import FinanceClientsList from './FinanceClientsList'
import ProductionClientList from './ProductionClientList'

const CompaniesTables = () => {
  return (
    <>
        <FinanceClientsList />
        <br />
        <ProductionClientList />
    </>
  )
}

export default CompaniesTables