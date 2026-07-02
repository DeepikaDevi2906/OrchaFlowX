from core.compensation import COMPENSATION_ACTIONS


def compensate(step_name):

    action = COMPENSATION_ACTIONS.get(step_name)

    if action:
        print(f"Compensating -> {action}")
    else:
        print(f"No compensation for {step_name}")