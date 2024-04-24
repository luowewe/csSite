public class NumberMethodsReference {

  public double add(double a, double b) {
    return a + b;
  }

  public double subtract(double a, double b) {
    return a - b;
  }

  public double multiply(double a, double b) {
    return a * b;
  }

  public double divide(double a, double b) {
    return a / b;
  }

  public double mod(double a, double b) {
    return a % b;
  }

  public double averageOfTwo(double a, double b) {
    return (a + b) / 2;
  }

  public double averageOfThree(double a, double b, double c) {
    return (a + b + c) / 3;
  }

  public double distance(double a, double b) {
    return Math.abs(a - b);
  }

  public double manhattanDistance(double x1, double y1, double x2, double y2) {
    return distance(x1, x2) + distance(y1, y2);
  }

  public double euclideanDistance(double x1, double y1, double x2, double y2) {
    var dx = x1 - x2;
    var dy = y1 - y2;
    return Math.sqrt(dx * dx + dy * dy);
  }

}
