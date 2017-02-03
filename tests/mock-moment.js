module.exports = function() {
  return new MockMoment();
}

class MockMoment {
  constructor (date) {
    this.date = date || 1;
  }
  add (value) {
    this.date += value;
    return this;
  }
  subtract(value) {
    this.date -= value;
    return this;
  }
  format(fmt) {
    return fmt.replace('%', this.date.toString(), 'g');
  }
}