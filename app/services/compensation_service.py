def release_inventory():
    print("Inventory Released")


def refund_payment():
    print("Payment Refunded")


def cancel_invoice():
    print("Invoice Cancelled")


def notify_customer():
    print("Customer Notified About Failure")


def validate_customer():
    print("Customer Validation Reverted")


def compensate(step_name):

    handlers = {
        "Reserve Inventory": release_inventory,
        "Process Payment": refund_payment,
        "Generate Invoice": cancel_invoice,
        "Notify Customer": notify_customer,
        "Validate Customer": validate_customer
    }

    handler = handlers.get(step_name)

    if handler:
        handler()
    else:
        print(f"No compensation available for {step_name}")