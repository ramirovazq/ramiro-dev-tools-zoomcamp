import argparse

# 1. Create the ArgumentParser object with a description
parser = argparse.ArgumentParser(
    description="A simple calculator program.",
    epilog="Thanks for using the calculator!"
)

# 2. Add positional arguments for numbers
parser.add_argument(
    "num1",
    type=float,
    help="The first number"
)
parser.add_argument(
    "num2",
    type=float,
    help="The second number"
)

# 3. Add an optional argument for the operation
parser.add_argument(
    "--operation", "-o",
    type=str,
    choices=["add", "subtract", "multiply", "divide"],
    default="add",
    help="The operation to perform (default: add)"
)

# 4. Parse the command-line arguments
args = parser.parse_args()

# Perform the calculation
result = 0
if args.operation == "add":
    result = args.num1 + args.num2
elif args.operation == "subtract":
    result = args.num1 - args.num2
elif args.operation == "multiply":
    result = args.num1 * args.num2
elif args.operation == "divide":
    result = args.num1 / args.num2

print(f"The result is: {result}")
