function main() {
  const select = ['title', 'slug', 'type', 'image', 'createdAt', 'author']
  let final = ''
  select.forEach((i) => {
    final = final + '&select[' + i + ']=true'
  })
  console.log(final)
}
main()
