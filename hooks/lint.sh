lintOutput=$(eslint --color .)

if [ "$lintOutput" != "" ]; then
	echo -e "\e[31mESLint found some errors, fix them before you can commit.\e[0m"
	echo "$lintOutput"
	exit 1
fi
