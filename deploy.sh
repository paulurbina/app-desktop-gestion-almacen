echo ">> start"

git add .
git commit -m "$1"
git push origin master

echo ">> end"
