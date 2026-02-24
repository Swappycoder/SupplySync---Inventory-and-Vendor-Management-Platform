package com.SupplySync.InventoryMgtSystem.services;

import com.SupplySync.InventoryMgtSystem.dtos.Response;
import com.SupplySync.InventoryMgtSystem.dtos.TransactionRequest;
import com.SupplySync.InventoryMgtSystem.enums.TransactionStatus;

public interface TransactionService {
    Response purchase(TransactionRequest transactionRequest);

    Response sell(TransactionRequest transactionRequest);

    Response returnToSupplier(TransactionRequest transactionRequest);

    Response getAllTransactions(int page, int size, String filter);

    Response getAllTransactionById(Long id);

    Response getAllTransactionByMonthAndYear(int month, int year);

    Response updateTransactionStatus(Long transactionId, TransactionStatus status);
}
